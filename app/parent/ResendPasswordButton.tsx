'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function ResendPasswordButton({ email }: { email: string }) {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleResend() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/resend-parent-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to send. Please try again.')
      } else {
        setSent(true)
        setTimeout(() => setSent(false), 3000)
      }
    } catch {
      setError('Failed to send. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" className="w-full" onClick={handleResend} disabled={loading || sent}>
        {sent ? 'Email sent! Check your inbox' : loading ? 'Sending…' : 'Resend login link'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
