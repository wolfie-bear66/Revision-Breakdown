import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { TopicAccordion, type Topic } from './TopicAccordion';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ subjectId: string }>;
}

export default async function SubjectPage({ params }: PageProps) {
  const { subjectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch subject details and user enrolment in parallel
  const [{ data: subject }, { data: userSubject }] = await Promise.all([
    supabase
      .from('subjects')
      .select('name, exam_board')
      .eq('id', subjectId)
      .single(),
    user
      ? supabase
          .from('user_subjects')
          .select('id')
          .eq('user_id', user.id)
          .eq('subject_id', subjectId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const isFree = !user;

  if (!subject) redirect('/dashboard');

  // Build topics list — empty if the user isn't enrolled
  let topics: Topic[] = [];
  let freeTopicIds = new Set<string>();

  if (user && userSubject) {
    // 1. Enrolled topic IDs for this subject
    const { data: userTopics } = await supabase
      .from('user_topics')
      .select('topic_id')
      .eq('user_subject_id', userSubject.id);

    const topicIds = (userTopics ?? []).map((ut) => ut.topic_id);

    if (topicIds.length > 0) {
      // 2. Topic details + blocks in parallel
      const [{ data: topicRows }, { data: blockRows }] = await Promise.all([
        supabase
          .from('topics')
          .select('id, name, is_free')
          .in('id', topicIds)
          .order('name'),
        supabase
          .from('blocks')
          .select('id, topic_id, block_name')
          .in('topic_id', topicIds)
          .order('block_name'),
      ]);

      const allBlocks = blockRows ?? [];
      const blockIds = allBlocks.map((b) => b.id);

      // 3. Completed sessions for this user across all these blocks
      const { data: completedSessions } = blockIds.length > 0
        ? await supabase
            .from('sessions')
            .select('block_id')
            .eq('user_id', user.id)
            .in('block_id', blockIds)
            .not('completed_at', 'is', null)
        : { data: [] };

      const completedBlockIds = new Set((completedSessions ?? []).map((s) => s.block_id));
      freeTopicIds = new Set((topicRows ?? []).filter((t) => t.is_free).map((t) => t.id));

      // 4. Assemble into Topic[]
      topics = (topicRows ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        blocks: allBlocks
          .filter((b) => b.topic_id === t.id)
          .map((b) => ({
            id: b.id,
            block_name: b.block_name,
            completed: completedBlockIds.has(b.id),
          })),
      }));
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
          <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {subject.exam_board}
          </span>
        </div>

        {/* Topics */}
        <TopicAccordion topics={topics} isFree={isFree} freeTopicIds={freeTopicIds} />
      </div>
    </main>
  );
}
