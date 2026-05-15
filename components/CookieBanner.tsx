'use client'
import { useEffect, useState } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('rb-cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('rb-cookie-consent', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('rb-cookie-consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        .cookie-banner {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          z-index: 9999; width: calc(100% - 48px); max-width: 600px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 16px; padding: 20px 24px;
          display: flex; align-items: flex-start; gap: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          animation: slide-up 0.3s ease;
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .cookie-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
        .cookie-text { flex: 1; }
        .cookie-text p { font-size: 14px; color: var(--text); line-height: 1.6; margin: 0 0 4px; }
        .cookie-text a { color: var(--mint); text-decoration: underline; }
        .cookie-text small { font-size: 12px; color: var(--muted); }
        .cookie-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
        .cookie-accept { background: var(--mint); color: #0e0e0e; font-weight: 700; font-size: 14px; padding: 8px 18px; border: none; border-radius: 99px; cursor: pointer; font-family: var(--font); transition: opacity 0.15s; }
        .cookie-accept:hover { opacity: 0.85; }
        .cookie-decline { background: transparent; color: var(--muted); font-weight: 700; font-size: 14px; padding: 8px 18px; border: 1px solid var(--border); border-radius: 99px; cursor: pointer; font-family: var(--font); transition: all 0.15s; }
        .cookie-decline:hover { color: var(--text); border-color: var(--text); }
        @media (max-width: 500px) {
          .cookie-banner { bottom: 16px; padding: 16px; }
          .cookie-icon { display: none; }
        }
      `}</style>
      <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
        <span className="cookie-icon">🍪</span>
        <div className="cookie-text">
          <p><strong>This site uses essential cookies</strong> to keep you logged in.</p>
          <small>
            We don&apos;t use advertising or tracking cookies. See our{' '}
            <a href="/privacy">Privacy Policy</a> for details.
          </small>
          <div className="cookie-actions">
            <button className="cookie-accept" onClick={accept}>Got it</button>
            <button className="cookie-decline" onClick={decline}>No thanks</button>
          </div>
        </div>
      </div>
    </>
  )
}
