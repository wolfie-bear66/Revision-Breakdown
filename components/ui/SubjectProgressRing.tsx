'use client';

import { useEffect, useId, useRef, useState } from 'react';

const TIER_COLORS = [
  '#4a9eff',
  '#1dd9c4',
  '#4ade80',
  '#a3e635',
  '#facc15',
  '#fb923c',
  '#f43f5e',
  '#e879f9',
  '#818cf8',
  '#ffd700',
];

const SESSIONS_PER_TIER = 10;
const MAX_SESSIONS = 100;
const SIZE = 96;
const CX = 48;
const CY = 48;
const R = 40;
const STROKE_WIDTH = 9;
const CIRCUMFERENCE = 2 * Math.PI * R;

interface SubjectProgressRingProps {
  completed: number;
  subjectName: string;
}

export function SubjectProgressRing({ completed, subjectName }: SubjectProgressRingProps) {
  const uid = useId();
  const filterId = `glow-${uid.replace(/:/g, '')}`;

  const prevRef = useRef(completed);
  const [flashKey, setFlashKey] = useState(0);

  useEffect(() => {
    if (completed !== prevRef.current) {
      prevRef.current = completed;
      setFlashKey(k => k + 1);
    }
  }, [completed]);

  const isMaxed = completed >= MAX_SESSIONS;
  const capped = Math.min(completed, MAX_SESSIONS);
  const currentTier = isMaxed ? 9 : Math.floor(capped / SESSIONS_PER_TIER);
  const sessionsInTier = isMaxed ? SESSIONS_PER_TIER : capped % SESSIONS_PER_TIER;
  const tierProgress = sessionsInTier / SESSIONS_PER_TIER;

  const currentColor = TIER_COLORS[currentTier];
  const prevColor = currentTier > 0 ? TIER_COLORS[currentTier - 1] : null;

  const arcOffset = (p: number) => CIRCUMFERENCE * (1 - p);

  // At a tier boundary (sessionsInTier=0, not maxed), flash the full ring to celebrate tier completion
  const flashProgress =
    completed > 0 && !isMaxed && sessionsInTier === 0 ? 1 : isMaxed ? 1 : tierProgress;
  const flashTarget = arcOffset(flashProgress);

  const textLen = String(completed).length;
  const fontSize = textLen <= 1 ? 22 : textLen <= 2 ? 20 : 16;

  return (
    <div className="relative inline-flex items-center justify-center">
      {flashKey > 0 && flashProgress > 0 && (
        <style>{`
          @keyframes flash-sweep-${flashKey} {
            from { stroke-dashoffset: ${CIRCUMFERENCE.toFixed(3)}; }
            to   { stroke-dashoffset: ${flashTarget.toFixed(3)}; }
          }
          @keyframes flash-fade-${flashKey} {
            0%   { opacity: 0; }
            15%  { opacity: 1; }
            55%  { opacity: 1; }
            100% { opacity: 0; }
          }
        `}</style>
      )}

      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-label={`${subjectName}: ${completed} sessions completed`}
        role="img"
        style={{ overflow: 'visible' }}
      >
        {isMaxed && (
          <defs>
            <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ffd700" floodOpacity="0.85" />
            </filter>
          </defs>
        )}

        {/* Track */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          className="text-[#e0e0e0] dark:text-[#333]"
        />

        {/* Previous tier — full ring base */}
        {prevColor && (
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={prevColor}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={0}
            transform={`rotate(-90 ${CX} ${CY})`}
          />
        )}

        {/* Current tier arc */}
        {(tierProgress > 0 || isMaxed) && (
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={currentColor}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={arcOffset(isMaxed ? 1 : tierProgress)}
            transform={`rotate(-90 ${CX} ${CY})`}
            filter={isMaxed ? `url(#${filterId})` : undefined}
          />
        )}

        {/* Flash arc */}
        {flashKey > 0 && flashProgress > 0 && (
          <circle
            key={flashKey}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="white"
            strokeWidth={STROKE_WIDTH + 5}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{
              animation: `flash-sweep-${flashKey} 700ms cubic-bezier(0.37, 0, 0.63, 1) both, flash-fade-${flashKey} 700ms linear both`,
            }}
          />
        )}
      </svg>

      <span
        className="absolute font-bold tabular-nums text-foreground pointer-events-none"
        style={{ fontSize }}
      >
        {completed}
      </span>
    </div>
  );
}
