'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button size="sm" variant="outline" onClick={handleCopy}>
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  )
}
