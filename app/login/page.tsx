'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Student access code panel
  const [showCodeLogin, setShowCodeLogin] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [codeLoading, setCodeLoading] = useState(false)

  function formatCode(raw: string): string {
    const clean = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10)
    if (clean.length <= 2) return clean
    if (clean.length <= 6) return `${clean.slice(0, 2)}-${clean.slice(2)}`
    return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6, 10)}`
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.refresh()
  }

  async function handleCodeLogin(e: React.FormEvent) {
    e.preventDefault()
    setCodeError('')
    setCodeLoading(true)

    try {
      const res = await fetch('/api/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        setCodeError(data.error || 'Something went wrong')
        setCodeLoading(false)
        return
      }

      // Set the session directly in the browser — no redirect chain through Supabase
      const supabase = createClient()
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
      })

      if (sessionError) {
        setCodeError('Failed to log in. Please try again.')
        setCodeLoading(false)
        return
      }

      // Full navigation so middleware sees the new session cookies
      window.location.href = '/dashboard'
    } catch {
      setCodeError('Something went wrong. Please try again.')
      setCodeLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">

        {/* Parent / email login */}
        <Card>
          <CardHeader>
            <CardTitle>Parent login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in…' : 'Log in'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/upgrade" className="underline underline-offset-4 hover:text-primary">
                  Get access for £5
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Student access code login */}
        <Card>
          <CardHeader className="pb-3">
            <button
              type="button"
              onClick={() => setShowCodeLogin((v) => !v)}
              className="flex w-full items-center justify-between text-left"
            >
              <CardTitle className="text-base">I have a student access code</CardTitle>
              <span className="text-muted-foreground text-lg leading-none">
                {showCodeLogin ? '−' : '+'}
              </span>
            </button>
          </CardHeader>

          {showCodeLogin && (
            <CardContent>
              <form onSubmit={handleCodeLogin} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="access-code">Access code</Label>
                  <Input
                    id="access-code"
                    type="text"
                    placeholder="RB-XXXX-XXXX"
                    value={accessCode}
                    onChange={(e) => setAccessCode(formatCode(e.target.value))}
                    maxLength={12}
                    required
                    autoComplete="off"
                    className="font-mono tracking-widest uppercase"
                  />
                </div>

                {codeError && <p className="text-sm text-destructive">{codeError}</p>}

                <Button type="submit" className="w-full" disabled={codeLoading}>
                  {codeLoading ? 'Logging in…' : 'Log in with code'}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

      </div>
    </main>
  )
}
