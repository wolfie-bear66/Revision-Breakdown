'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'

export function ResendPasswordButton({ email }: { email: string }) {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleResend() {
    setLoading(true)
    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/set-password`,
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleResend} disabled={loading || sent}>
      {sent ? 'Email sent — check your inbox' : loading ? 'Sending…' : 'Resend login link to myself'}
    </Button>
  )
}
