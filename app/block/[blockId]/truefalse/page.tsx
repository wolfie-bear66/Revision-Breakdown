import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { fetchBlockData } from '@/utils/fetch-block';
import { TrueFalseQuiz } from './TrueFalseQuiz';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ blockId: string }>;
}

export default async function TrueFalsePage({ params }: PageProps) {
  const { blockId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await fetchBlockData(blockId);

  if (!result.ok) {
    if (result.status === 401) redirect('/upgrade');
    if (result.status === 403 && result.locked) redirect('/upgrade');
    redirect('/dashboard');
  }

  const { data } = result;
  const blockName = data.block_name;
  const subjectId = data.subject.id ?? null;

  const questions = data.questions
    .filter((q) => q.type === 'true_false')
    .map((q) => ({
      id: q.id,
      question: q.question,
      correct_answer: q.correct_answer,
    }));

  if (questions.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <p className="text-muted-foreground">No True/False questions found for this block.</p>
        {subjectId && (
          <Link
            href={`/subject/${subjectId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to topics
          </Link>
        )}
      </main>
    );
  }

  let sessionId: string | null = null;
  if (user) {
    const { data: session } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        block_id: blockId,
        mode: 'truefalse',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (!session) redirect('/dashboard');
    sessionId = session.id;
  }

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        {subjectId ? (
          <Link
            href={`/subject/${subjectId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {blockName}
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        )}
        <span className="ml-auto rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          True / False
        </span>
      </header>

      <TrueFalseQuiz
        blockId={blockId}
        sessionId={sessionId}
        questions={questions}
        subjectId={subjectId}
      />
    </main>
  );
}
