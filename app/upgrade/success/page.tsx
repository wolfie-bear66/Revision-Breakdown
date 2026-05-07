import Link from 'next/link';

export default function UpgradeSuccessPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center flex flex-col items-center gap-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">You&apos;re all set.</h1>
          <p className="text-muted-foreground">
            Payment confirmed. Every subject, every topic — all unlocked.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Go to your dashboard
        </Link>
      </div>
    </main>
  );
}
