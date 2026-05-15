'use client'
import Link from 'next/link'
import { ReactNode } from 'react'

interface LegalPageProps {
  title: string
  label: string
  children: ReactNode
}

interface SectionProps {
  heading?: string
  children: ReactNode
}

export function Section({ heading, children }: SectionProps) {
  return (
    <div className="legal-section">
      {heading && <h2 className="legal-h2">{heading}</h2>}
      {children}
    </div>
  )
}

export function ContactCard() {
  return (
    <div className="contact-card">
      <div className="contact-card-inner">
        <span className="contact-icon">✉</span>
        <div>
          <p className="contact-label">Email us</p>
          <a href="mailto:revisionbreakdown@gmail.com" className="contact-email">
            revisionbreakdown@gmail.com
          </a>
          <p className="contact-note">We aim to reply within 48 hours.</p>
        </div>
      </div>
    </div>
  )
}

export default function LegalPage({ title, label, children }: LegalPageProps) {
  return (
    <>
      <style>{`
        .legal-topbar {
          position: sticky; top: 0; z-index: 200;
          background: var(--surface); border-bottom: 1px solid var(--border);
          padding: 0 24px; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
          transition: background 0.25s, color 0.25s, border-color 0.25s;
        }
        .legal-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .legal-brand-name { font-size: 17px; font-weight: 700; color: var(--text); letter-spacing: -0.01em; }
        .legal-brand-name em { color: var(--amber); font-style: normal; }
        .legal-back { font-size: 14px; font-weight: 700; color: var(--muted); text-decoration: none;
          padding: 6px 14px; border: 1px solid var(--border); border-radius: 99px; transition: all 0.15s; }
        .legal-back:hover { color: var(--text); border-color: var(--text); }
        .legal-hero { padding: 64px 24px 48px; border-bottom: 1px solid var(--border); background: var(--surface); }
        .legal-hero-inner { max-width: 720px; margin: 0 auto; }
        .legal-label { font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--mint); margin-bottom: 12px; }
        .legal-title { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 700; color: var(--heading); line-height: 1.15; letter-spacing: -0.02em; }
        .legal-body { max-width: 720px; margin: 0 auto; padding: 48px 24px 80px; }
        .legal-section { margin-bottom: 40px; }
        .legal-h2 { font-size: 1.15rem; font-weight: 700; color: var(--heading); margin-bottom: 14px; margin-top: 8px; }
        .legal-body p { color: var(--text); line-height: 1.8; margin-bottom: 14px; }
        .legal-body a { color: var(--mint); text-decoration: underline; }
        .legal-body strong { color: var(--heading); }
        .legal-body table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 14px; }
        .legal-body th { text-align: left; padding: 10px 12px; font-weight: 700; color: var(--muted); border-bottom: 2px solid var(--border); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; }
        .legal-body td { padding: 10px 12px; color: var(--text); border-bottom: 1px solid var(--border); vertical-align: top; line-height: 1.6; }
        .contact-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 28px; margin-bottom: 14px; }
        .contact-card-inner { display: flex; align-items: flex-start; gap: 20px; }
        .contact-icon { font-size: 24px; width: 52px; height: 52px; background: rgba(61,217,164,0.1); border: 1px solid rgba(61,217,164,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .contact-label { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
        .contact-email { font-size: 18px; font-weight: 700; color: var(--mint); text-decoration: none; display: block; margin-bottom: 6px; }
        .contact-email:hover { text-decoration: underline; }
        .contact-note { font-size: 14px; color: var(--muted); }
        .legal-footer { background: var(--surface); border-top: 1px solid var(--border); padding: 28px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .legal-footer-brand { font-size: 15px; font-weight: 700; color: var(--muted); }
        .legal-footer-brand em { color: var(--amber); font-style: normal; }
        .legal-footer-links { display: flex; gap: 20px; list-style: none; }
        .legal-footer-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color 0.15s; }
        .legal-footer-links a:hover { color: var(--text); }
        .legal-footer-copy { font-size: 12px; color: var(--muted); }
        @media (max-width: 700px) {
          .legal-hero { padding: 40px 16px 32px; }
          .legal-body { padding: 32px 16px 60px; }
          .legal-body table { font-size: 13px; }
          .legal-body th, .legal-body td { padding: 8px; }
        }
      `}</style>
      <header className="legal-topbar">
        <Link href="/" className="legal-brand">
          <span className="legal-brand-name">Revision <em>Breakdown</em></span>
        </Link>
        <Link href="/" className="legal-back">← Back to home</Link>
      </header>
      <div className="legal-hero">
        <div className="legal-hero-inner">
          <p className="legal-label">{label}</p>
          <h1 className="legal-title">{title}</h1>
        </div>
      </div>
      <main className="legal-body">{children}</main>
      <footer className="legal-footer">
        <span className="legal-footer-brand">Revision <em>Breakdown</em></span>
        <ul className="legal-footer-links">
          <li><Link href="/about">About</Link></li>
          <li><Link href="/terms">Terms</Link></li>
          <li><Link href="/privacy">Privacy</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
        <span className="legal-footer-copy">© 2025 Revision Breakdown</span>
      </footer>
    </>
  )
}
