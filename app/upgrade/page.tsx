'use client'

import { useState } from 'react'

export default function UpgradePage() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)

    const res = await fetch('/api/create-checkout-session', { method: 'POST' })

    if (!res.ok) {
      const text = await res.text()
      console.error('API error:', text)
      alert('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert('No redirect URL returned. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md flex flex-col gap-8">

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Unlock Revision Breakdown</h1>
          <p className="mt-2 text-gray-500">One payment. Every subject. No subscription traps.</p>
        </div>

        <div className="rounded-2xl border border-indigo-500 bg-indigo-50 shadow-lg p-6 flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-indigo-700">Early Access</h2>
            <span className="text-3xl font-bold text-indigo-600">£5</span>
          </div>
          <p className="text-sm text-gray-600">
            Full access to all 33 subjects, all question types, unlimited revision
          </p>
          <button
            onClick={handleClick}
            disabled={loading}
            className="mt-auto rounded-xl py-2.5 px-4 text-sm font-medium transition-colors disabled:opacity-60 bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {loading ? 'Redirecting…' : 'Unlock everything — £5'}
          </button>
        </div>

      </div>
    </main>
  )
}
