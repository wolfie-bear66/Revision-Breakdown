'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  question: string;
  correct_answer: string;
}

interface TrueFalseQuizProps {
  blockId: string;
  sessionId: string | null;
  questions: Question[];
  subjectId: string | null;
}

type AnswerState = 'idle' | 'correct' | 'incorrect';

export function TrueFalseQuiz({ blockId, sessionId, questions, subjectId }: TrueFalseQuizProps) {
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(questions);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<'true' | 'false' | null>(null);
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
                <p className="text-sm text-muted-foreground mt-0.5">
                  Answer: {q.correct_answer.toLowerCase() === 'true' ? 'True' : 'False'}
                </p>
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

  const question = activeQuestions[index];
  const total = activeQuestions.length;
  const isLast = index + 1 >= total;

  async function handleAnswer(answer: 'true' | 'false') {
    if (submitting || answerState !== 'idle') return;
    setSubmitting(true);
    setSelected(answer);

    const correct = answer.toLowerCase() === question.correct_answer.toLowerCase();
    setAnswerState(correct ? 'correct' : 'incorrect');

    if (!correct) {
      setWrongQuestions((prev) => [...prev, question]);
    }

    const supabase = createClient();
    if (sessionId) {
      await supabase.from('card_attempts').insert({
        session_id: sessionId,
        question_id: question.id,
        correct,
        score: correct ? 1 : 0,
        answered_at: new Date().toISOString(),
      });
    }

    setCorrectCount((c) => c + (correct ? 1 : 0));
    setSubmitting(false);
  }

  async function handleNext() {
    const newCorrect = correctCount + (answerState === 'correct' ? 1 : 0);

    if (isLast) {
      if (sessionId) {
        const supabase = createClient();
        await supabase
          .from('sessions')
          .update({
            completed_at: new Date().toISOString(),
            score: newCorrect,
            total,
          })
          .eq('id', sessionId);
      }

      setFinalScore({ correct: newCorrect, total });
      setGameOver(true);
      return;
    }

    setSelected(null);
    setAnswerState('idle');
    setIndex((i) => i + 1);
  }

  function buttonStyle(value: 'true' | 'false') {
    const isTrue = value === 'true';
    const baseColour = isTrue
      ? { active: 'border-green-500 bg-green-500 text-white', idle: 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100' }
      : { active: 'border-red-500 bg-red-500 text-white', idle: 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100' };

    if (answerState === 'idle') return baseColour.idle;

    const isCorrectAnswer = value === question.correct_answer.toLowerCase();
    const isSelected = value === selected;

    if (isCorrectAnswer) return baseColour.active;
    if (isSelected) return 'border-border bg-muted text-muted-foreground';
    return 'border-border bg-muted text-muted-foreground opacity-40';
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-8 sm:py-10 mx-auto w-full max-w-lg">
      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          <span>Statement {index + 1} of {total}</span>
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
      <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-border bg-card p-8 shadow-sm">
        <p className="text-center text-2xl font-bold leading-snug text-card-foreground sm:text-3xl">
          {question.question}
        </p>
      </div>

      {/* True / False buttons */}
      <div className="flex gap-3">
        {(['true', 'false'] as const).map((value) => (
          <button
            key={value}
            onClick={() => handleAnswer(value)}
            disabled={answerState !== 'idle' || submitting}
            className={cn(
              'flex-1 rounded-xl border-2 py-5 text-xl font-bold',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-default',
              buttonStyle(value)
            )}
          >
            {value === 'true' ? '✓ True' : '✗ False'}
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
              : `✗ The answer was: ${question.correct_answer.toLowerCase() === 'true' ? 'True' : 'False'}`}
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
  );
}
