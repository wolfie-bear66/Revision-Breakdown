'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [code, setCode] = useState<string | null>(null)
  const [parentEmail, setParentEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const [resendError, setResendError] = useState('')

  useEffect(() => {
    if (!sessionId) { setLoading(false); return }

    let attempts = 0
    const MAX_ATTEMPTS = 12

    const poll = async () => {
      try {
        const res = await fetch(`/api/get-session-code?session_id=${sessionId}`)
        if (res.ok) {
          const data = await res.json()
          setCode(data.code)
          setParentEmail(data.parentEmail ?? null)
          setLoading(false)
          // Sign out any auto-created session so parent reaches /login cleanly
          await createClient().auth.signOut()
          return
        }
      } catch {}

      attempts++
      if (attempts < MAX_ATTEMPTS) {
        setTimeout(poll, 2000)
      } else {
        setLoading(false)
      }
    }

    poll()
  }, [sessionId])

  async function handleResendEmail() {
    if (!parentEmail) return
    setResendLoading(true)
    setResendError('')
    try {
      const res = await fetch('/api/resend-parent-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: parentEmail }),
      })
      if (!res.ok) {
        const d = await res.json()
        setResendError(d.error || 'Failed to send. Please try again.')
      } else {
        setResendSent(true)
      }
    } catch {
      setResendError('Failed to send. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  function handleCopy() {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <svg className="h-7 w-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <CardTitle className="text-2xl">Payment confirmed!</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading ? (
          <div className="text-center space-y-3">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Setting up your account…</p>
          </div>
        ) : code ? (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Your child&apos;s access code</p>
              <div className="flex items-center gap-2 rounded-lg border-2 border-primary/30 bg-primary/5 px-4 py-3">
                <span className="flex-1 font-mono text-xl font-bold tracking-widest text-primary">
                  {code}
                </span>
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
              <p className="font-medium">What happens next:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Check your email — we&apos;ve sent a link to set your password</li>
                <li>Share this code with your child</li>
                <li>They visit <strong>revision-breakdown.vercel.app/login</strong> and enter it</li>
              </ol>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              You can also find this code any time on your parent dashboard after setting your password.
            </p>

            {parentEmail && (
              <div className="rounded-lg border p-4 text-sm space-y-2">
                <p className="font-medium">Set up your account</p>
                <p className="text-muted-foreground">
                  We&apos;ve sent a link to <strong>{parentEmail}</strong> to set your password.
                </p>
                {resendSent ? (
                  <p className="text-sm text-green-600 font-medium">Email sent! Check your inbox.</p>
                ) : (
                  <button
                    onClick={handleResendEmail}
                    disabled={resendLoading}
                    className="text-primary underline underline-offset-4 hover:opacity-75 disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending…' : "Didn't get it? Resend email"}
                  </button>
                )}
                {resendError && <p className="text-sm text-destructive">{resendError}</p>}
              </div>
            )}

            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Go to login
            </Link>
          </>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Your account is being set up. Check your email shortly — your student access code will arrive there too.
            </p>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Go to login
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function PaymentSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </CardContent>
          </Card>
        }
      >
        <PaymentSuccessContent />
      </Suspense>
    </main>
  )
}
