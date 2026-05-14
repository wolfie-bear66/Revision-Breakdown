'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
}

interface MCQQuizProps {
  blockId: string;
  sessionId: string | null;
  questions: Question[];
  subjectId: string | null;
}

type AnswerState = 'idle' | 'correct' | 'incorrect';

function stripPrefix(option: string): string {
  return option.replace(/^[A-D]\)\s*/, '');
}

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MCQQuiz({ blockId, sessionId, questions, subjectId }: MCQQuizProps) {
  const processedQuestions = useMemo<Question[]>(() =>
    questions.map((q) => {
      const correctOption = q.options.find((o) => o.match(new RegExp(`^${q.correct_answer}\\)`)));
      const correctText = correctOption ? stripPrefix(correctOption) : q.correct_answer;
      return {
        ...q,
        options: fisherYates(q.options.map(stripPrefix)),
        correct_answer: correctText,
      };
    }),
  [questions]);

  const [activeQuestions, setActiveQuestions] = useState<Question[]>(processedQuestions);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState({ correct: 0, total: 0 });

  function startRetry(retryQuestions: Question[]) {
    setActiveQuestions(retryQuestions);
    setWrongQuestions([]);
    setIndex(0);
    setSelected(null);
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
              onClick={() => startRetry(processedQuestions)}
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

  const question = activeQuestions[index];
  const total = activeQuestions.length;

  async function handleSelect(option: string) {
    if (submitting || answerState !== 'idle') return;
    setSubmitting(true);
    setSelected(option);

    const correct = option === question.correct_answer;
    setAnswerState(correct ? 'correct' : 'incorrect');

    if (!correct) {
      setWrongQuestions((prev) => [...prev, question]);
    }

    if (sessionId) {
      const supabase = createClient();
      await supabase.from('card_attempts').insert({
        session_id: sessionId,
        question_id: question.id,
        correct,
        score: correct ? 1 : 0,
        answered_at: new Date().toISOString(),
      });
    }

    setCorrectCount((prev) => prev + (correct ? 1 : 0));
    setSubmitting(false);
  }

  async function handleNext() {
    const nextIndex = index + 1;

    if (nextIndex >= total) {
      if (sessionId) {
        const supabase = createClient();
        await supabase
          .from('sessions')
          .update({
            completed_at: new Date().toISOString(),
            score: correctCount,
            total,
          })
          .eq('id', sessionId);
      }

      setFinalScore({ correct: correctCount, total });
      setGameOver(true);
      return;
    }

    setSelected(null);
    setAnswerState('idle');
    setIndex(nextIndex);
  }

  function optionStyle(option: string) {
    if (answerState === 'idle') {
      return 'border-border bg-card text-card-foreground hover:border-primary hover:bg-primary/5';
    }
    if (option === question.correct_answer) {
      return 'border-green-500 bg-green-50 text-green-800';
    }
    if (option === selected && answerState === 'incorrect') {
      return 'border-red-500 bg-red-50 text-red-800';
    }
    return 'border-border bg-card text-muted-foreground opacity-50';
  }

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

      {/* Question */}
      <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Question
        </p>
        <p className="text-xl font-bold leading-snug text-card-foreground sm:text-2xl">
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(option)}
            disabled={answerState !== 'idle'}
            className={cn(
              'w-full rounded-xl border-2 px-5 py-4 text-left text-base font-medium',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-default',
              optionStyle(option)
            )}
          >
            <span className="mr-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
              {String.fromCharCode(65 + i)}
            </span>
            {option}
          </button>
        ))}
      </div>

      {/* Feedback + Next */}
      {answerState !== 'idle' && (
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
              'transition-colors hover:opacity-90 active:opacity-80',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            {index + 1 >= total ? 'See results' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}
