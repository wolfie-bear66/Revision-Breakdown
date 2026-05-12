'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';

interface Card {
  id: string;
  keyword: string;
  definition: string;
}

interface FlashcardDeckProps {
  blockId: string;
  sessionId: string | null;
  cards: Card[];
  subjectId: string | null;
}

export function FlashcardDeck({ blockId, sessionId, cards, subjectId }: FlashcardDeckProps) {
  const [activeCards, setActiveCards] = useState<Card[]>(cards);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [definitionFirst, setDefinitionFirst] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCards, setWrongCards] = useState<Card[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState({ correct: 0, total: 0 });

  function startRetry(retryCards: Card[]) {
    setActiveCards(retryCards);
    setWrongCards([]);
    setIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setSubmitting(false);
    setGameOver(false);
  }

  if (gameOver) {
    const pct = finalScore.total > 0 ? Math.round((finalScore.correct / finalScore.total) * 100) : 0;

    return (
      <div className="flex flex-1 flex-col items-center gap-8 px-4 py-10 mx-auto w-full max-w-lg">
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-5xl font-bold text-foreground">
            {finalScore.correct} / {finalScore.total}
          </p>
          <p className="text-xl text-muted-foreground">{pct}%</p>
        </div>

        {wrongCards.length > 0 && (
          <div className="w-full flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              To review
            </p>
            {wrongCards.map((c) => (
              <div key={c.id} className="rounded-xl border-2 border-border bg-card px-4 py-3">
                <p className="font-semibold text-card-foreground">{c.keyword}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{c.definition}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 w-full mt-auto">
          {wrongCards.length > 0 ? (
            <button
              onClick={() => startRetry(wrongCards)}
              className="w-full rounded-xl border-2 border-primary bg-primary py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Retry wrong answers ({wrongCards.length})
            </button>
          ) : (
            <button
              onClick={() => startRetry(cards)}
              className="w-full rounded-xl border-2 border-primary bg-primary py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Retry
            </button>
          )}
          {!sessionId ? (
            <>
              <Link
                href="/free"
                className="w-full rounded-xl border-2 border-border bg-card py-4 text-base font-semibold text-card-foreground text-center transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Try another free topic
              </Link>
              <Link
                href="/upgrade"
                className="w-full rounded-xl border-2 border-primary bg-primary py-4 text-base font-semibold text-primary-foreground text-center transition-opacity hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Unlock everything — £5
              </Link>
            </>
          ) : (
            subjectId && (
              <Link
                href={`/subject/${subjectId}`}
                className="w-full rounded-xl border-2 border-border bg-card py-4 text-base font-semibold text-card-foreground text-center transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Back to topic
              </Link>
            )
          )}
        </div>
      </div>
    );
  }

  const card = activeCards[index];
  const total = activeCards.length;

  async function handleAnswer(correct: boolean) {
    if (submitting) return;
    setSubmitting(true);

    const supabase = createClient();

    if (sessionId) {
      await supabase.from('card_attempts').insert({
        session_id: sessionId,
        card_id: card.id,
        correct,
        score: correct ? 1 : 0,
        answered_at: new Date().toISOString(),
      });
    }

    const newCorrect = correctCount + (correct ? 1 : 0);
    const newWrong = correct ? wrongCards : [...wrongCards, card];
    const nextIndex = index + 1;

    if (nextIndex >= total) {
      if (sessionId) {
        await supabase
          .from('sessions')
          .update({
            completed_at: new Date().toISOString(),
            score: newCorrect,
            total,
          })
          .eq('id', sessionId);
      }

      setWrongCards(newWrong);
      setFinalScore({ correct: newCorrect, total });
      setGameOver(true);
      return;
    }

    setCorrectCount(newCorrect);
    setWrongCards(newWrong);
    setIsFlipped(false);
    setIndex(nextIndex);
    setSubmitting(false);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-6 px-4 py-8 sm:py-12">
      {/* Progress */}
      <div className="flex w-full max-w-lg flex-col gap-2">
        <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          <span>
            Card {index + 1} of {total}
          </span>
          <div className="flex items-center gap-2">
            <span>{Math.round((index / total) * 100)}% done</span>
            <button
              onClick={() => { setDefinitionFirst((d) => !d); setIsFlipped(false); }}
              className="flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              ⇄ Flip direction
            </button>
          </div>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Flip card */}
      <div
        className="w-full max-w-lg cursor-pointer select-none"
        style={{ perspective: '1200px' }}
        onClick={() => !submitting && setIsFlipped((f) => !f)}
        role="button"
        aria-label={
          definitionFirst
            ? (isFlipped ? 'Showing keyword — click to flip back' : 'Showing definition — click to reveal keyword')
            : (isFlipped ? 'Showing definition — click to flip back' : 'Showing keyword — click to reveal definition')
        }
      >
        <div
          className={cn(
            'relative h-64 sm:h-72 md:h-80',
            '[transform-style:preserve-3d]',
            'transition-transform duration-500',
            isFlipped && '[transform:rotateY(180deg)]'
          )}
        >
          {/* Front face */}
          <div
            className={cn(
              'absolute inset-0 rounded-2xl border-2 border-border bg-card shadow-lg',
              '[backface-visibility:hidden]',
              'flex flex-col items-center justify-center gap-4 p-8'
            )}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {definitionFirst ? 'Definition' : 'Keyword'}
            </span>
            <p className="text-center text-2xl font-bold leading-snug text-card-foreground sm:text-3xl">
              {definitionFirst ? card.definition : card.keyword}
            </p>
            <span className="mt-2 text-xs text-muted-foreground">tap to reveal</span>
          </div>

          {/* Back face */}
          <div
            className={cn(
              'absolute inset-0 rounded-2xl border-2 border-primary bg-primary shadow-lg',
              '[backface-visibility:hidden] [transform:rotateY(180deg)]',
              'flex flex-col items-center justify-center gap-4 p-8'
            )}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">
              {definitionFirst ? 'Keyword' : 'Definition'}
            </span>
            <p className="text-center text-2xl font-bold leading-snug text-primary-foreground sm:text-3xl">
              {definitionFirst ? card.keyword : card.definition}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons — only visible after flipping */}
      <div
        className={cn(
          'flex w-full max-w-lg gap-3 transition-all duration-300',
          isFlipped ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-4'
        )}
      >
        <button
          onClick={() => handleAnswer(false)}
          disabled={submitting || !isFlipped}
          className={cn(
            'flex-1 rounded-xl border-2 border-red-200 bg-red-50 py-4 text-base font-semibold text-red-600',
            'transition-colors hover:bg-red-100 active:bg-red-200',
            'disabled:pointer-events-none disabled:opacity-50',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500'
          )}
        >
          Still learning
        </button>
        <button
          onClick={() => handleAnswer(true)}
          disabled={submitting || !isFlipped}
          className={cn(
            'flex-1 rounded-xl border-2 border-green-200 bg-green-50 py-4 text-base font-semibold text-green-600',
            'transition-colors hover:bg-green-100 active:bg-green-200',
            'disabled:pointer-events-none disabled:opacity-50',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500'
          )}
        >
          Got it ✓
        </button>
      </div>
    </div>
  );
}
