'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  question: string;
  correct_answer: string;
}

interface FillBlankQuizProps {
  blockId: string;
  sessionId: string;
  questions: Question[];
  subjectId: string | null;
}

type AnswerState = 'idle' | 'correct' | 'incorrect';

function normalise(s: string) {
  return s.trim().toLowerCase().replace(/[.,!?;:'"]+$/, '');
}

function QuestionText({ text }: { text: string }) {
  const parts = text.split('___');
  return (
    <p className="text-center text-2xl font-bold leading-snug text-card-foreground sm:text-3xl">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="inline-block min-w-[6rem] border-b-4 border-primary align-bottom mx-1" />
          )}
        </span>
      ))}
    </p>
  );
}

export function FillBlankQuiz({ blockId, sessionId, questions, subjectId }: FillBlankQuizProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [activeQuestions, setActiveQuestions] = useState<Question[]>(questions);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState({ correct: 0, total: 0 });

  const question = activeQuestions[index];
  const total = activeQuestions.length;
  const isLast = index + 1 >= total;

  useEffect(() => {
    inputRef.current?.focus();
  }, [index]);

  function startRetry(retryQuestions: Question[]) {
    setActiveQuestions(retryQuestions);
    setWrongQuestions([]);
    setIndex(0);
    setValue('');
    setAnswerState('idle');
    setSubmitting(false);
    setCorrectCount(0);
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

        {wrongQuestions.length > 0 && (
          <div className="w-full flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Incorrect answers
            </p>
            {wrongQuestions.map((q) => (
              <div key={q.id} className="rounded-xl border-2 border-border bg-card px-4 py-3">
                <p className="font-semibold text-card-foreground">{q.question}</p>
                <p className="text-sm text-muted-foreground mt-0.5">Answer: {q.correct_answer}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 w-full mt-auto">
          {wrongQuestions.length > 0 ? (
            <button
              onClick={() => startRetry(wrongQuestions)}
              className="w-full rounded-xl border-2 border-primary bg-primary py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Retry wrong answers ({wrongQuestions.length})
            </button>
          ) : (
            <button
              onClick={() => startRetry(questions)}
              className="w-full rounded-xl border-2 border-primary bg-primary py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Retry
            </button>
          )}
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

  async function handleCheck() {
    if (submitting || answerState !== 'idle' || value.trim() === '') return;
    setSubmitting(true);

    const correct = normalise(value) === normalise(question.correct_answer);
    setAnswerState(correct ? 'correct' : 'incorrect');

    if (!correct) {
      setWrongQuestions((prev) => [...prev, question]);
    }

    const supabase = createClient();
    await supabase.from('card_attempts').insert({
      session_id: sessionId,
      question_id: question.id,
      correct,
      score: correct ? 1 : 0,
      answered_at: new Date().toISOString(),
    });

    setCorrectCount((c) => c + (correct ? 1 : 0));
    setSubmitting(false);
  }

  async function handleNext() {
    const newCorrect = correctCount + (answerState === 'correct' ? 1 : 0);

    if (isLast) {
      const supabase = createClient();
      await supabase
        .from('sessions')
        .update({
          completed_at: new Date().toISOString(),
          score: newCorrect,
          total,
        })
        .eq('id', sessionId);

      setFinalScore({ correct: newCorrect, total });
      setGameOver(true);
      return;
    }

    setValue('');
    setAnswerState('idle');
    setIndex((i) => i + 1);
  }

  const answered = answerState !== 'idle';

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-8 sm:py-10 mx-auto w-full max-w-lg">
      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          <span>Question {index + 1} of {total}</span>
          <span>{Math.round((index / total) * 100)}% done</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Statement card */}
      <div className="flex items-center justify-center rounded-2xl border-2 border-border bg-card p-8 shadow-sm min-h-36">
        <QuestionText text={question.question} />
      </div>

      {/* Input */}
      <div className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') answered ? handleNext() : handleCheck(); }}
          disabled={answered}
          placeholder="Type your answer…"
          className={cn(
            'w-full rounded-xl border-2 bg-card px-5 py-4 text-base font-medium text-card-foreground placeholder:text-muted-foreground',
            'outline-none transition-colors duration-150',
            'disabled:cursor-default',
            !answered && 'border-border focus:border-primary',
            answered && answerState === 'correct' && 'border-green-500 bg-green-50 text-green-800',
            answered && answerState === 'incorrect' && 'border-red-500 bg-red-50 text-red-800'
          )}
        />

        {!answered ? (
          <button
            onClick={handleCheck}
            disabled={submitting || value.trim() === ''}
            className={cn(
              'w-full rounded-xl border-2 border-primary bg-primary py-4 text-base font-semibold text-primary-foreground',
              'transition-opacity hover:opacity-90 active:opacity-80',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-40'
            )}
          >
            Check answer
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <p
              className={cn(
                'text-center text-sm font-medium',
                answerState === 'correct' ? 'text-green-600' : 'text-red-600'
              )}
            >
              {answerState === 'correct'
                ? '✓ Correct!'
                : `✗ The answer was: ${question.correct_answer}`}
            </p>
            <button
              onClick={handleNext}
              className={cn(
                'w-full rounded-xl border-2 border-primary bg-primary py-4 text-base font-semibold text-primary-foreground',
                'transition-opacity hover:opacity-90 active:opacity-80',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              )}
            >
              {isLast ? 'See results' : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
