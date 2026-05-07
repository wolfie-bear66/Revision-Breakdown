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

      // Supabase magic link handles the session — redirect to it
      window.location.href = data.loginUrl
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
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    required
                    autoComplete="off"
                    className="font-mono tracking-widest"
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
