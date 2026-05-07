import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { fetchBlockData } from '@/utils/fetch-block';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, LayoutGrid, RefreshCw } from 'lucide-react';

interface PageProps {
  params: Promise<{ blockId: string }>;
  searchParams: Promise<{ correct?: string; total?: string; mode?: string; sessionId?: string }>;
}

const MODE_LABELS: Record<string, string> = {
  flashcards:     'Flashcards',
  mcq:            'Multiple Choice',
  truefalse:      'True / False',
  fillintheblank: 'Fill in the Blank',
  matchup:        'Match-Up',
};

function performanceMessage(pct: number) {
  if (pct >= 90) return { text: 'Excellent work!',              emoji: '🎉' };
  if (pct >= 70) return { text: 'Great effort!',                emoji: '👍' };
  if (pct >= 50) return { text: 'Good try — keep practising',  emoji: '📚' };
  return          { text: 'Keep going — revision takes time',   emoji: '💪' };
}

export default async function EndPage({ params, searchParams }: PageProps) {
  const { blockId } = await params;
  const { correct: correctParam, total: totalParam, mode, sessionId } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const result = await fetchBlockData(blockId);

  if (!result.ok) {
    if (result.status === 401) redirect('/login');
    if (result.status === 403 && result.locked) redirect('/upgrade');
    redirect('/dashboard');
  }

  const subjectId = result.data.subject.id ?? null;

  const { data: userData } = await supabase
    .from('users')
    .select('subscription_status')
    .eq('id', user.id)
    .single();

  const isFree = !userData || userData.subscription_status !== 'active';

  const correct = parseInt(correctParam ?? '0', 10);
  const total   = parseInt(totalParam   ?? '1', 10);
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;
  const perf    = performanceMessage(pct);
  const modeLabel = mode ? (MODE_LABELS[mode] ?? mode) : 'Revision';
  const modeHref  = mode ? `/block/${blockId}/${mode}` : `/block/${blockId}`;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">

        {/* Mode badge */}
        <span className="rounded-full bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {modeLabel}
        </span>

        {/* Score */}
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-8xl font-black tabular-nums tracking-tight text-foreground leading-none">
            {correct}<span className="text-muted-foreground/50">/</span>{total}
          </p>
          <p className="text-lg font-semibold text-muted-foreground">{pct}%</p>
        </div>

        {/* Performance message */}
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-4xl" role="img" aria-label={perf.text}>{perf.emoji}</span>
          <p className="text-xl font-bold text-foreground">{perf.text}</p>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-border" />

        {/* Actions */}
        <div className="flex w-full flex-col gap-3">
          <Link
            href={modeHref}
            className={cn(buttonVariants({ variant: 'default' }), 'w-full justify-center gap-2 py-3 text-sm')}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Link>

          {isFree ? (
            <div className="rounded-xl border border-border bg-muted p-5 flex flex-col gap-3 text-center">
              <p className="text-base font-bold text-foreground">Want to keep going?</p>
              <p className="text-sm text-muted-foreground">
                Unlock all 33 subjects and 113 topics for £5 — one payment, no subscription.
              </p>
              <Link
                href="/upgrade"
                className={cn(buttonVariants({ variant: 'default' }), 'w-full justify-center gap-2 py-3 text-sm')}
              >
                Unlock everything — £5
              </Link>
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: 'ghost' }), 'w-full justify-center gap-2 py-3 text-sm')}
              >
                Continue for free
              </Link>
            </div>
          ) : (
            <>
              {subjectId && (
                <Link
                  href={`/subject/${subjectId}`}
                  className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-center gap-2 py-3 text-sm')}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Choose another mode
                </Link>
              )}
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: 'ghost' }), 'w-full justify-center gap-2 py-3 text-sm')}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
