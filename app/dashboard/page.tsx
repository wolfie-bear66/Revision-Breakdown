import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { SubjectCard } from './SubjectCard';
import { SignOutButton } from './SignOutButton';
import { ResetTopicsButton } from './ResetTopicsButton';
import { buttonVariants } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FREE_SUBJECT_IDS } from '@/lib/free-topics';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: progress }, { data: lastSession }, { data: userSessions }] = user
    ? await Promise.all([
        supabase
          .from('user_subject_progress')
          .select('user_id, subject_id, subject_name, exam_board, total_blocks, completed_blocks')
          .eq('user_id', user.id),
        supabase
          .from('sessions')
          .select('block_id')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('sessions')
          .select('id, blocks(topics(subject_id))')
          .eq('user_id', user.id),
      ])
    : [{ data: null }, { data: null }, { data: null }];

  const isFree = !user;

  // Build session → subject_id map
  const sessionToSubject: Record<string, string> = {};
  for (const s of userSessions ?? []) {
    const block = Array.isArray(s.blocks) ? s.blocks[0] : s.blocks;
    const topic = block ? (Array.isArray((block as any).topics) ? (block as any).topics[0] : (block as any).topics) : null;
    const subjectId = topic?.subject_id;
    if (subjectId) sessionToSubject[s.id] = subjectId;
  }

  // Fetch attempt counts for all sessions in one query
  const sessionIds = Object.keys(sessionToSubject);
  const { data: attempts } = sessionIds.length > 0
    ? await supabase.from('card_attempts').select('session_id').in('session_id', sessionIds)
    : { data: [] };

  const attemptsBySubject: Record<string, number> = {};
  for (const a of attempts ?? []) {
    const subjectId = sessionToSubject[a.session_id];
    if (subjectId) attemptsBySubject[subjectId] = (attemptsBySubject[subjectId] ?? 0) + 1;
  }

  const subjects = progress ?? [];
  const continueBlockId = lastSession?.block_id ?? null;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header row */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Your Subjects</h1>

            {continueBlockId ? (
              <Link
                href={`/block/${continueBlockId}`}
                className={cn(buttonVariants({ variant: 'default' }), 'gap-2')}
              >
                <BookOpen className="h-4 w-4" />
                Continue where you left off
              </Link>
            ) : (
              <span
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'pointer-events-none gap-2 opacity-50'
                )}
              >
                <BookOpen className="h-4 w-4" />
                No sessions yet
              </span>
            )}
          </div>

          <SignOutButton />
        </div>

        {/* Subject grid */}
        {subjects.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
            <p className="text-muted-foreground">You haven&apos;t added any subjects yet.</p>
            <Link href="/onboarding" className={buttonVariants({ variant: 'outline' })}>
              Get started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {subjects.map((s) => (
              <SubjectCard
                key={s.subject_id}
                subject_id={s.subject_id}
                subject_name={s.subject_name}
                exam_board={s.exam_board}
                total_blocks={s.total_blocks}
                completed_blocks={s.completed_blocks}
                attemptCount={attemptsBySubject[s.subject_id] ?? 0}
                isFreeUser={isFree}
                isFreeTopic={FREE_SUBJECT_IDS.includes(s.subject_id)}
              />
            ))}
          </div>
        )}
        <div className="mt-10 flex justify-center">
          <ResetTopicsButton />
        </div>
      </div>
    </main>
  );
}
