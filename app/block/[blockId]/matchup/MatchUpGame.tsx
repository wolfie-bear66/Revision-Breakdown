'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';

interface Pair {
  term: string;
  definition: string;
}

interface MatchUpGameProps {
  blockId: string;
  sessionId: string;
  questionId: string;
  instruction: string;
  pairs: Pair[];
  subjectId: string | null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MatchUpGame({
  blockId,
  sessionId,
  questionId,
  instruction,
  pairs,
  subjectId,
}: MatchUpGameProps) {
  const [unmatchedTerms, setUnmatchedTerms] = useState(() =>
    shuffle(pairs.map((p) => p.term))
  );
  const [unmatchedDefs, setUnmatchedDefs] = useState(() =>
    shuffle(pairs.map((p) => p.definition))
  );
  const [matched, setMatched] = useState<Pair[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [flashPair, setFlashPair] = useState<{ term: string; def: string } | null>(null);
  const [errors, setErrors] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalErrors, setFinalErrors] = useState(0);

  function retry() {
    setUnmatchedTerms(shuffle(pairs.map((p) => p.term)));
    setUnmatchedDefs(shuffle(pairs.map((p) => p.definition)));
    setMatched([]);
    setSelectedTerm(null);
    setFlashPair(null);
    setErrors(0);
    setSubmitting(false);
    setGameOver(false);
  }

  if (gameOver) {
    const minAttempts = pairs.length;
    const totalAttempts = pairs.length + finalErrors;

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-10 mx-auto w-full max-w-lg">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-5xl font-bold text-foreground">
            {totalAttempts}
          </p>
          <p className="text-base text-muted-foreground">
            {totalAttempts === 1 ? 'attempt' : 'attempts'} — minimum was {minAttempts}
          </p>
          {finalErrors === 0 && (
            <p className="text-sm font-semibold text-green-600">Perfect — no mistakes!</p>
          )}
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={retry}
            className="w-full rounded-xl border-2 border-primary bg-primary py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Retry
          </button>
          {subjectId && (
            <Link
              href={`/subject/${subjectId}`}
              className="w-full rounded-xl border-2 border-border bg-card py-4 text-base font-semibold text-card-foreground text-center transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Back to topic
            </Link>
          )}
        </div>
      </div>
    );
  }

  const remaining = unmatchedTerms.length;

  function handleTermTap(term: string) {
    if (flashPair || submitting) return;
    setSelectedTerm((prev) => (prev === term ? null : term));
  }

  function handleDefTap(def: string) {
    if (!selectedTerm || flashPair || submitting) return;

    const isCorrect = pairs.some(
      (p) => p.term === selectedTerm && p.definition === def
    );

    if (isCorrect) {
      const newUnmatchedTerms = unmatchedTerms.filter((t) => t !== selectedTerm);
      const newUnmatchedDefs = unmatchedDefs.filter((d) => d !== def);
      const newMatched = [...matched, { term: selectedTerm, definition: def }];

      setUnmatchedTerms(newUnmatchedTerms);
      setUnmatchedDefs(newUnmatchedDefs);
      setMatched(newMatched);
      setSelectedTerm(null);

      if (newUnmatchedTerms.length === 0) {
        finishGame(errors);
      }
    } else {
      const flashedTerm = selectedTerm;
      setFlashPair({ term: flashedTerm, def });
      setSelectedTerm(null);
      setErrors((e) => e + 1);
      setTimeout(() => setFlashPair(null), 500);
    }
  }

  async function finishGame(errorCount: number) {
    if (submitting) return;
    setSubmitting(true);

    const correct = errorCount === 0;
    const supabase = createClient();

    await supabase.from('card_attempts').insert({
      session_id: sessionId,
      question_id: questionId,
      correct,
      score: correct ? 1 : 0,
      answered_at: new Date().toISOString(),
    });

    await supabase
      .from('sessions')
      .update({
        completed_at: new Date().toISOString(),
        score: correct ? 1 : 0,
        total: 1,
      })
      .eq('id', sessionId);

    setFinalErrors(errorCount);
    setGameOver(true);
  }

  function termStyle(term: string) {
    if (flashPair?.term === term)
      return 'border-red-400 bg-red-50 text-red-700 scale-95';
    if (selectedTerm === term)
      return 'border-blue-500 bg-blue-50 text-blue-800 shadow-md';
    return 'border-border bg-card text-card-foreground hover:border-primary hover:bg-primary/5';
  }

  function defStyle(def: string) {
    if (flashPair?.def === def)
      return 'border-red-400 bg-red-50 text-red-700 scale-95';
    if (!selectedTerm)
      return 'border-border bg-card text-muted-foreground cursor-default';
    return 'border-border bg-card text-card-foreground hover:border-primary hover:bg-primary/5';
  }

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 py-6 sm:py-8 mx-auto w-full max-w-2xl">
      {/* Instruction + counter */}
      <div className="flex items-start justify-between gap-4">
        <p className="text-base font-semibold text-foreground">{instruction}</p>
        <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground whitespace-nowrap">
          {remaining} left
        </span>
      </div>

      {/* Hint */}
      {!selectedTerm && remaining > 0 && (
        <p className="text-xs text-muted-foreground -mt-2">
          Tap a term, then tap its matching definition.
        </p>
      )}
      {selectedTerm && (
        <p className="text-xs text-blue-600 -mt-2 font-medium">
          &ldquo;{selectedTerm}&rdquo; selected — now tap its definition.
        </p>
      )}

      {/* Two-column grid */}
      {remaining > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {/* Terms */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Terms
            </p>
            {unmatchedTerms.map((term) => (
              <button
                key={term}
                onClick={() => handleTermTap(term)}
                disabled={submitting}
                className={cn(
                  'w-full rounded-xl border-2 px-3 py-3 text-left text-sm font-medium',
                  'transition-all duration-150',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:cursor-default',
                  termStyle(term)
                )}
              >
                {term}
              </button>
            ))}
          </div>

          {/* Definitions */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Definitions
            </p>
            {unmatchedDefs.map((def) => (
              <button
                key={def}
                onClick={() => handleDefTap(def)}
                disabled={!selectedTerm || submitting}
                className={cn(
                  'w-full rounded-xl border-2 px-3 py-3 text-left text-sm font-medium',
                  'transition-all duration-150',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:cursor-default',
                  defStyle(def)
                )}
              >
                {def}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Matched pairs */}
      {matched.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Matched
          </p>
          {matched.map((pair) => (
            <div
              key={pair.term}
              className="grid grid-cols-2 gap-2 rounded-xl border-2 border-green-400 bg-green-50 px-3 py-3"
            >
              <p className="text-sm font-semibold text-green-800">{pair.term}</p>
              <p className="text-sm text-green-700">{pair.definition}</p>
            </div>
          ))}
        </div>
      )}

      {/* Error counter */}
      {errors > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {errors} incorrect {errors === 1 ? 'attempt' : 'attempts'} so far
        </p>
      )}
    </div>
  );
}
