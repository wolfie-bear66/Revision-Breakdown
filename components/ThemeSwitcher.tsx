'use client';

import { useTheme, type Theme } from '@/lib/theme-context';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'reading', label: 'Reading' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ display: 'flex', gap: 4 }} role="group" aria-label="Choose display theme">
      {THEMES.map(({ value, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            aria-pressed={active}
            style={{
              padding: '5px 11px',
              borderRadius: '99px',
              border: `1px solid ${active ? 'var(--mint)' : 'var(--border)'}`,
              background: active ? 'var(--mint)' : 'transparent',
              color: active ? '#0e0e0e' : 'var(--muted)',
              fontWeight: active ? 700 : 400,
              fontSize: 12,
              fontFamily: 'var(--font-atkinson, var(--font-sans), sans-serif)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
