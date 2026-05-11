'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

function ConfirmInner() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const [error, setError] = useState('')

  useEffect(() => {
    const handleSession = async () => {
      const hash = window.location.hash
      if (hash) {
        const params = new URLSearchParams(hash.replace('#', ''))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        if (accessToken && refreshToken) {
          const { error: setErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (setErr) {
            setError('Failed to establish session. Please request a new link.')
            return
          }
          router.replace(next)
          return
        }
      }

      // No hash — check if session already exists (e.g. navigated here directly)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace(next)
      } else {
        setError('Invalid or expired link. Please request a new one.')
      }
    }

    handleSession()
  }, [])

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-destructive">{error}</p>
          <a href="/login" className="underline underline-offset-2 text-sm">
            Back to login
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <p className="text-muted-foreground text-sm">Signing you in…</p>
    </main>
  )
}

export default function AuthConfirmPage() {
  return (
    <Suspense>
      <ConfirmInner />
    </Suspense>
  )
}
