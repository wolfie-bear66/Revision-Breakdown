'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

const S: Record<string, React.CSSProperties> = {
  bg:       { background: 'var(--bg)' },
  surface:  { background: 'var(--surface)' },
  surface2: { background: 'var(--surface2)' },
  text:     { color: 'var(--text)' },
  muted:    { color: 'var(--muted)' },
  heading:  { color: 'var(--heading)' },
  mint:     { color: 'var(--mint)' },
  amber:    { color: 'var(--amber)' },
  border:   { border: '1px solid var(--border)' },
};

const font = { fontFamily: 'var(--font-atkinson, var(--font-sans), sans-serif)' };

const QUOTES = [
  { problem: '"I don\'t know where to start"', answer: 'Start here with RB.', attr: 'Year 10 student' },
  { problem: '"What do they mean \'Put more detail in\'"', answer: 'Keywords are the details.', attr: 'Year 11 student' },
  { problem: '"I know what it is, I just don\'t get the question"', answer: 'RB unlocks the questions.', attr: 'Year 10 student' },
  { problem: '"I opened a revision guide and just felt lost"', answer: 'This was made for you.', attr: 'Year 11 student' },
  { problem: '"They revise but it just doesn\'t stick"', answer: 'One keyword at a time. It will stick.', attr: 'Parent of a Year 10 student' },
  { problem: '"They panic about every subject"', answer: 'This breaks it into pieces they can manage.', attr: 'Parent of a Year 11 student' },
];

const MODE_PILLS = [
  { label: 'Flashcards',    bg: '#378ADD' },
  { label: 'MCQ',           bg: '#7F77DD' },
  { label: 'True/False',    bg: '#1D9E75' },
  { label: 'Fill in Blank', bg: '#D85A30' },
  { label: 'Match-Up',      bg: '#D4537E' },
];

const STEPS = [
  {
    num: '1',
    heading: 'Parent pays once — £5, no subscription',
    body: 'Checkout takes 60 seconds. You receive a student login code by email. No student data is ever collected or stored.',
  },
  {
    num: '2',
    heading: 'Student picks their subjects & exam board',
    body: '28 subjects across AQA, Edexcel, OCR and Eduqas. Combined and separate science included. Your exam board, your topics.',
  },
  {
    num: '3',
    heading: 'Revise in 5 modes — 15 minutes is enough',
    body: 'Flashcards, multiple choice, true/false, fill in the blank, and match-up. Every question reads itself aloud.',
  },
  {
    num: '4',
    heading: 'Watch progress build — earn badges for every subject',
    body: 'Colour rings fill as you answer more questions. Complete every block and earn the subject badge. Parents can check in any time.',
  },
];

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);

  // Reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Active step tracker for desktop sticky list
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = parseInt(e.target.getAttribute('data-step') ?? '0', 10);
            setActiveStep(idx);
          }
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll('.step-panel').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollToStep(idx: number) {
    document.getElementById(`step-panel-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div style={{ ...S.bg, ...font, minHeight: '100vh', overflowX: 'hidden', lineHeight: 1.6 }}>

      {/* ── STICKY NAV ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 200, height: 64,
        ...S.surface, borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image
            src="/RB_Logo_No_Background.png"
            alt="Revision Breakdown"
            width={40}
            height={40}
            style={{ borderRadius: '8px', objectFit: 'cover' }}
          />
          <span style={{ fontSize: 17, fontWeight: 700, ...S.text }}>
            Revision <span style={S.amber}>Breakdown</span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeSwitcher />
          <Link
            href="/login"
            style={{
              fontSize: 14, fontWeight: 700, ...S.muted,
              padding: '6px 14px', ...S.border, borderRadius: 99,
              textDecoration: 'none', transition: 'all 0.15s',
            }}
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex', alignItems: 'center',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div className="hero-grid" style={{ display: 'grid', gap: 48, alignItems: 'center' }}>
            {/* Text column */}
            <div style={{ maxWidth: 620, textAlign: 'center', margin: '0 auto' }}>
              <div style={{
                display: 'inline-block', fontSize: 13, fontWeight: 700,
                color: 'var(--mint)', border: '1px solid var(--mint)',
                borderRadius: 99, padding: '6px 14px', marginBottom: 20,
              }}>
                Free to try · No sign-up needed
              </div>
              <h1 style={{
                fontSize: 'clamp(2.2rem, 6vw, 3.4rem)', fontWeight: 700,
                ...S.heading, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 20,
              }}>
                GCSE-ready in{' '}
                <span style={S.amber}>15 minutes a day</span>
                {' '}— starting with the keywords that unlock every question.
              </h1>
              <p style={{
                fontSize: '1.15rem', ...S.muted,
                maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7,
              }}>
                No revision guides. No wasted evenings. Just the keywords that unlock exam questions — picked by a teacher, tested in real classrooms with 200+ students.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                <Link href="/free" style={{
                  background: 'var(--mint)', color: '#0e0e0e', fontWeight: 700,
                  borderRadius: 99, padding: '14px 28px', textDecoration: 'none',
                  fontSize: 16, transition: 'opacity 0.15s, transform 0.15s',
                }}>
                  Try a free topic →
                </Link>
                <Link href="/upgrade" style={{
                  border: '1px solid var(--border)', background: 'transparent',
                  ...S.text, fontWeight: 700, borderRadius: 99,
                  padding: '14px 28px', textDecoration: 'none',
                  fontSize: 16, transition: 'border-color 0.15s, transform 0.15s',
                }}>
                  Unlock everything — £5
                </Link>
              </div>
              <p style={{ fontSize: 13, ...S.muted }}>No account. No subscription. Try free, pay £5 once.</p>
            </div>

            {/* Trophy image — desktop only */}
            <div className="hero-image-col" style={{ display: 'none' }}>
              <Image
                src="/landing/trophy.png"
                alt="Revision Breakdown trophy"
                width={520}
                height={480}
                style={{ borderRadius: 16, objectFit: 'contain', width: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{
        ...S.surface, borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        padding: '16px 24px',
      }}>
        <div style={{
          maxWidth: 860, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 32, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint)' }}>
            ★ 200+ students and their parents
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, ...S.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
            Dyslexia &amp; ADHD Friendly
            <span style={{
              background: 'rgba(61,217,164,0.1)', border: '1px solid rgba(61,217,164,0.25)',
              borderRadius: 99, padding: '4px 12px', fontSize: 13, fontWeight: 700,
              color: 'var(--mint)',
            }}>
              Accessible
            </span>
          </span>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section style={{ ...S.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="reveal" style={{ marginBottom: 56, textAlign: 'center' }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', ...S.amber, marginBottom: 12 }}>
              How it works
            </p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 700, ...S.heading, marginBottom: 12 }}>
              Four steps. Zero faff.
            </h2>
            <p style={{ fontSize: '1rem', ...S.muted, maxWidth: 520, margin: '0 auto' }}>
              Parent pays once. Student gets a login code. Pick subjects. Start revising.
            </p>
          </div>

          {/* ── DESKTOP: sticky left + scrolling right ── */}
          <div className="hiw-desktop-grid">

            {/* Left column: sticky step list */}
            <div style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
              {STEPS.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => scrollToStep(idx)}
                  style={{
                    padding: '28px 0',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'flex-start', gap: 20,
                  }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                    background: activeStep === idx ? 'var(--mint)' : 'var(--surface2)',
                    color: activeStep === idx ? '#0e0e0e' : 'var(--text)',
                    fontSize: 18, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.3s, color 0.3s',
                  }}>
                    {step.num}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: 18, fontWeight: 700, marginBottom: 8,
                      color: activeStep === idx ? 'var(--mint)' : 'var(--heading)',
                      transition: 'color 0.3s',
                    }}>
                      {step.heading}
                    </h3>
                    <p style={{ ...S.muted, lineHeight: 1.7 }}>{step.body}</p>
                    {idx === 2 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                        {MODE_PILLS.map(({ label, bg }) => (
                          <span key={label} style={{
                            background: bg, color: '#fff',
                            fontSize: 12, fontWeight: 700,
                            padding: '4px 12px', borderRadius: 99,
                          }}>
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right column: scrolling image panels */}
            <div>
              {/* Panel 1 — code card */}
              <div
                id="step-panel-0"
                data-step="0"
                className="step-panel"
                style={{ minHeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}
              >
                <div style={{
                  ...S.surface, border: '1px solid var(--border)',
                  borderRadius: 12, padding: 24, textAlign: 'center', maxWidth: 340, width: '100%',
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', ...S.muted, marginBottom: 8 }}>
                    YOUR CODE
                  </p>
                  <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--mint)', letterSpacing: '0.08em', marginBottom: 8 }}>
                    RB-4821-KXQT
                  </p>
                  <p style={{ fontSize: 12, ...S.muted }}>Share with your child</p>
                </div>
              </div>

              {/* Panel 2 — topics.png */}
              <div
                id="step-panel-1"
                data-step="1"
                className="step-panel"
                style={{ minHeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}
              >
                <Image
                  src="/landing/topics.png"
                  alt="Topic selection screenshot"
                  width={540}
                  height={460}
                  style={{ borderRadius: 12, objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
                />
              </div>

              {/* Panel 3 — flashcard.png + matchup.png */}
              <div
                id="step-panel-2"
                data-step="2"
                className="step-panel"
                style={{ minHeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 }}
              >
                <Image
                  src="/landing/flashcard.png"
                  alt="Flashcard mode screenshot"
                  width={460}
                  height={340}
                  style={{ borderRadius: 12, objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
                />
                <Image
                  src="/landing/matchup.png"
                  alt="Match-up mode screenshot"
                  width={460}
                  height={380}
                  style={{ borderRadius: 12, objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
                />
              </div>

              {/* Panel 4 — rings.png + parent.png */}
              {/* Note: replace rings.png with dashboard.png once that file is added to public/landing/ */}
              <div
                id="step-panel-3"
                data-step="3"
                className="step-panel"
                style={{ minHeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 }}
              >
                <Image
                  src="/landing/rings.png"
                  alt="Progress dashboard screenshot"
                  width={480}
                  height={360}
                  style={{ borderRadius: 12, objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
                />
                <Image
                  src="/landing/parent.png"
                  alt="Parent dashboard screenshot"
                  width={480}
                  height={400}
                  style={{ borderRadius: 12, objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </div>

          {/* ── MOBILE: stacked steps ── */}
          <div className="hiw-mobile-list">
            {STEPS.map((step, idx) => (
              <div key={idx} style={{ marginBottom: idx < 3 ? 48 : 0 }}>

                {/* Step header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--mint)', color: '#0e0e0e',
                    fontSize: 18, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {step.num}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, ...S.heading, marginBottom: 8 }}>
                      {step.heading}
                    </h3>
                    <p style={{ ...S.muted, lineHeight: 1.7 }}>{step.body}</p>
                    {idx === 2 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                        {MODE_PILLS.map(({ label, bg }) => (
                          <span key={label} style={{
                            background: bg, color: '#fff',
                            fontSize: 12, fontWeight: 700,
                            padding: '4px 12px', borderRadius: 99,
                          }}>
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step visual */}
                {idx === 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                      ...S.surface, border: '1px solid var(--border)',
                      borderRadius: 12, padding: 24, textAlign: 'center', maxWidth: 300, width: '100%',
                    }}>
                      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', ...S.muted, marginBottom: 8 }}>
                        YOUR CODE
                      </p>
                      <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--mint)', letterSpacing: '0.08em', marginBottom: 8 }}>
                        RB-4821-KXQT
                      </p>
                      <p style={{ fontSize: 12, ...S.muted }}>Share with your child</p>
                    </div>
                  </div>
                )}
                {idx === 1 && (
                  <Image
                    src="/landing/topics.png"
                    alt="Topic selection screenshot"
                    width={540}
                    height={460}
                    style={{ borderRadius: 12, objectFit: 'contain', width: '100%', height: 'auto' }}
                  />
                )}
                {idx === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Image
                      src="/landing/flashcard.png"
                      alt="Flashcard mode screenshot"
                      width={460}
                      height={340}
                      style={{ borderRadius: 12, objectFit: 'contain', width: '100%', height: 'auto' }}
                    />
                    <Image
                      src="/landing/matchup.png"
                      alt="Match-up mode screenshot"
                      width={460}
                      height={380}
                      style={{ borderRadius: 12, objectFit: 'contain', width: '100%', height: 'auto' }}
                    />
                  </div>
                )}
                {idx === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Image
                      src="/landing/rings.png"
                      alt="Progress dashboard screenshot"
                      width={480}
                      height={360}
                      style={{ borderRadius: 12, objectFit: 'contain', width: '100%', height: 'auto' }}
                    />
                    <Image
                      src="/landing/parent.png"
                      alt="Parent dashboard screenshot"
                      width={480}
                      height={400}
                      style={{ borderRadius: 12, objectFit: 'contain', width: '100%', height: 'auto' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCROLLING QUOTES ── */}
      <div style={{ background: 'var(--amber)', padding: '56px 0', overflow: 'hidden' }} className="quotes-section">
        <div style={{ overflow: 'hidden', width: '100%' }}>
          <div
            className="quotes-track"
            style={{
              display: 'flex', gap: 24, width: 'max-content',
              animation: 'scroll-quotes 24s linear infinite',
            }}
          >
            {[...QUOTES, ...QUOTES].map((q, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  borderRadius: 16, padding: '28px 32px',
                  minWidth: 340, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}
              >
                <p style={{ fontSize: 15, fontStyle: 'italic', color: 'rgba(14,14,14,0.75)', fontWeight: 700 }}>
                  {q.problem}
                </p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#0e0e0e' }}>
                  {q.answer}
                </p>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(14,14,14,0.5)', marginTop: 4 }}>
                  {q.attr}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ ...S.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="reveal" style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', ...S.amber, marginBottom: 12 }}>
              Pricing
            </p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 700, ...S.heading, marginBottom: 12 }}>
              £5. Once. Done.
            </h2>
            <p style={{ ...S.muted }}>Less than a revision guide. No monthly fee. Cancel nothing.</p>
          </div>

          <div className="pricing-grid reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Free card */}
            <div style={{
              ...S.surface, border: '1px solid var(--border)',
              borderRadius: 14, padding: '32px 28px',
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', ...S.muted, marginBottom: 8 }}>Free</p>
              <div style={{ fontSize: '2.6rem', fontWeight: 700, ...S.heading, lineHeight: 1, marginBottom: 4 }}>£0</div>
              <p style={{ fontSize: 14, ...S.muted, marginBottom: 24, lineHeight: 1.6 }}>
                Try it now — no sign-up needed. Five subjects available free.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28 }}>
                {[
                  ['✓', 'Flashcards, multiple choice, true/false, fill in the blank, match-up'],
                  ['✓', 'Read-aloud on all questions'],
                  ['✓', 'Maths, English Language, English Literature, Biology, Music — free'],
                  ['–', '23 more subjects locked'],
                  ['–', 'Trophy Cabinet locked'],
                  ['–', 'Progress dashboard locked'],
                ].map(([icon, text]) => (
                  <li key={text} style={{
                    fontSize: 14, ...S.text,
                    padding: '8px 0', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                  }}>
                    <span style={{ color: icon === '✓' ? 'var(--mint)' : 'var(--muted)', fontWeight: 700, flexShrink: 0 }}>{icon}</span>
                    {text}
                  </li>
                ))}
              </ul>
              <Link href="/free" style={{
                display: 'block', width: '100%', textAlign: 'center',
                padding: 14, borderRadius: 99, fontSize: 15, fontWeight: 700,
                border: '1px solid var(--border)', background: 'transparent', ...S.text,
                textDecoration: 'none', transition: 'opacity 0.15s',
              }}>
                Try a free topic →
              </Link>
            </div>

            {/* Full Access card */}
            <div style={{
              ...S.surface, border: '2px solid var(--mint)',
              borderRadius: 14, padding: '32px 28px', position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--mint)', color: '#0e0e0e',
                fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 99,
                whiteSpace: 'nowrap',
              }}>
                Best value
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', ...S.muted, marginBottom: 8 }}>Full Access</p>
              <div style={{ fontSize: '2.6rem', fontWeight: 700, ...S.heading, lineHeight: 1, marginBottom: 4 }}>
                <sup style={{ fontSize: '1.2rem', verticalAlign: 'super' }}>£</sup>5
              </div>
              <p style={{ fontSize: 14, ...S.muted, marginBottom: 24, lineHeight: 1.6 }}>
                One payment. Everything unlocked. Less than a revision guide.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28 }}>
                {[
                  'All 28 subjects',
                  'All 113 topics',
                  'AQA, Edexcel, OCR & Eduqas',
                  'All 5 question modes',
                  'Read-aloud on everything',
                  'Colour progress rings',
                  'Trophy Cabinet — earn subject badges',
                  'Parent dashboard view',
                ].map((text) => (
                  <li key={text} style={{
                    fontSize: 14, color: 'var(--mint)', fontWeight: 700,
                    padding: '8px 0', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                  }}>
                    <span style={{ flexShrink: 0 }}>✓</span>
                    {text}
                  </li>
                ))}
              </ul>
              <Link href="/upgrade" style={{
                display: 'block', width: '100%', textAlign: 'center',
                padding: 14, borderRadius: 99, fontSize: 15, fontWeight: 700,
                background: 'var(--mint)', color: '#0e0e0e',
                textDecoration: 'none', transition: 'opacity 0.15s',
              }}>
                Unlock everything — £5
              </Link>
            </div>
          </div>

          <p className="reveal" style={{ fontSize: 13, ...S.muted, textAlign: 'center', marginTop: 24 }}>
            Try it free. No account needed. If it&apos;s not right, you&apos;ve lost nothing.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        ...S.surface, borderTop: '1px solid var(--border)',
        padding: '28px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, ...S.muted }}>
          Revision <span style={S.amber}>Breakdown</span>
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['About', '/about'], ['Contact', '/contact'], ['Privacy', '/privacy']].map(([label, href]) => (
            <Link key={label} href={href} style={{ fontSize: 13, ...S.muted, textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
        </div>
        <span style={{ fontSize: 12, ...S.muted }}>© 2025 Revision Breakdown</span>
      </footer>

      {/* Responsive + animation CSS */}
      <style>{`
        .hero-grid { grid-template-columns: 1fr; }
        .pricing-grid { grid-template-columns: 1fr 1fr; }
        .hiw-desktop-grid { display: none; }
        .hiw-mobile-list { display: block; }

        @media (min-width: 768px) {
          .hero-grid { grid-template-columns: 1fr 1fr; }
          .hero-grid > div:first-child { text-align: left; margin: 0; }
          .hero-grid > div:first-child p { margin-left: 0; }
          .hero-grid > div:first-child div[style*="justify-content: center"] { justify-content: flex-start; }
          .hero-image-col { display: block !important; }
          .hiw-desktop-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
            align-items: start;
          }
          .hiw-mobile-list { display: none; }
        }

        @media (max-width: 600px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }

        .quotes-track:hover { animation-play-state: paused; }

        @keyframes scroll-quotes {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .reveal.revealed { opacity: 1; transform: translateY(0); }
      `}</style>
    </div>
  );
}
