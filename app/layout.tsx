import type { Metadata } from 'next';
import './globals.css';
import { Geist, Atkinson_Hyperlegible } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Providers } from './providers';
import { Analytics } from '@vercel/analytics/react';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-atkinson',
});

export const metadata: Metadata = {
  title: 'Revision Breakdown',
  description: 'GCSE revision for students',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={cn('dark font-sans', geist.variable, atkinson.variable)}
    >
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
