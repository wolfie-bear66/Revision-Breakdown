'use client';

import { ThemeProvider } from '@/lib/theme-context';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
