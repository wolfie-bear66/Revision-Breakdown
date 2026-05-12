'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SubjectCardProps {
  subject_id: string;
  subject_name: string;
  exam_board: string;
  total_blocks: number;
  completed_blocks: number;
  isFreeUser: boolean;
  isFreeTopic: boolean;
}

export function SubjectCard({
  subject_id,
  subject_name,
  exam_board,
  total_blocks,
  completed_blocks,
  isFreeUser,
  isFreeTopic,
}: SubjectCardProps) {
  const router = useRouter();
  const locked = isFreeUser && !isFreeTopic;

  const pct = total_blocks > 0 ? Math.round((completed_blocks / total_blocks) * 100) : 0;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;

  const cardInner = (
    <Card className={cn('h-full transition-shadow', locked ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-md cursor-pointer')}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">
            {locked ? '🔒 ' : ''}{subject_name}
          </CardTitle>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', 'bg-primary/10 text-primary')}>
              {exam_board}
            </span>
            {isFreeTopic && (
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', 'bg-primary/10 text-primary')}>
                Free
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-3 pt-2 pb-2">
        {/* Circular progress ring */}
        <div
          className="relative flex items-center justify-center"
          aria-label={`${completed_blocks} of ${total_blocks} blocks done`}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
            {/* Track */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/30"
            />
            {/* Progress */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="text-primary transition-all duration-500"
            />
          </svg>
          <span className="absolute text-sm font-semibold tabular-nums">{completed_blocks}/{total_blocks}</span>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {completed_blocks} / {total_blocks} blocks done
        </p>
      </CardContent>
    </Card>
  );

  if (locked) {
    return (
      <div className="text-left w-full rounded-xl">
        {cardInner}
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push(`/subject/${subject_id}`)}
      className="text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
    >
      {cardInner}
    </button>
  );
}
