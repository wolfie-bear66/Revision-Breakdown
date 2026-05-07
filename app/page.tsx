import Script from 'next/script';
import { createClient } from '@/utils/supabase/server';

const css = `
html { scroll-behavior: smooth; }

#landing-root {
  --mint: #3dd9a4;
  --amber: #f5a623;
  --font: 'Atkinson Hyperlegible', sans-serif;
  --r: 14px;
  --transition: background 0.25s, color 0.25s, border-color 0.25s;
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  transition: var(--transition);
  overflow-x: hidden;
  font-size: 17px;
  line-height: 1.6;
  display: block;
  width: 100%;
}

#landing-root[data-theme="dark"] {
  --bg: #0e0e0e;
  --surface: #1a1a1a;
  --surface2: #242424;
  --border: #333333;
  --text: #f0f0ec;
  --muted: #888880;
  --heading: #f0f0ec;
}
#landing-root[data-theme="light"] {
  --bg: #f4f4f0;
  --surface: #ffffff;
  --surface2: #ebebе6;
  --border: #d8d8d0;
  --text: #1a1a18;
  --muted: #6b6b60;
  --heading: #1a1a18;
}
#landing-root[data-theme="reading"] {
  --bg: #fdf6e3;
  --surface: #faefd4;
  --surface2: #e8dfc8;
  --border: #c8b896;
  --text: #111111;
  --muted: #444444;
  --heading: #111111;
  --mint: #2a7a5a;
  --amber: #7a5a1a;
}

#landing-root *, #landing-root *::before, #landing-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── TOPBAR ── */
#landing-root .topbar {
  position: sticky;
  top: 0;
  z-index: 200;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: var(--transition);
}
#landing-root .topbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
#landing-root .brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--surface2);
}
#landing-root .brand-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
#landing-root .brand-name {
  font-family: var(--font);
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
}
#landing-root .brand-name em { color: var(--amber); font-style: normal; }

#landing-root .topbar-right { display: flex; align-items: center; gap: 12px; }
#landing-root .theme-btns { display: flex; gap: 4px; }
#landing-root .theme-btn {
  padding: 5px 11px;
  border-radius: 99px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  font-size: 12px;
  font-family: var(--font);
  font-weight: 400;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.15s;
}
#landing-root .theme-btn.active {
  background: var(--mint);
  color: #0e0e0e;
  border-color: var(--mint);
  font-weight: 700;
}
#landing-root .nav-signin {
  font-size: 14px;
  font-family: var(--font);
  font-weight: 700;
  color: var(--muted);
  text-decoration: none;
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: 99px;
  transition: all 0.15s;
}
#landing-root .nav-signin:hover { color: var(--text); border-color: var(--text); }

/* ── SECTIONS ── */
#landing-root section { padding: 80px 24px; }
#landing-root .inner { max-width: 860px; margin: 0 auto; }

/* ── HERO ── */
#landing-root .hero {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  padding: 80px 24px;
  position: relative;
}
#landing-root .hero-inner {
  max-width: 680px;
  margin: 0 auto;
  text-align: center;
}
#landing-root .hero-logo {
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  border-radius: 20px;
  overflow: hidden;
  background: var(--surface2);
}
#landing-root .hero-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
#landing-root .hero-eyebrow {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mint);
  margin-bottom: 20px;
  padding: 6px 14px;
  border: 1px solid var(--mint);
  border-radius: 99px;
  opacity: 0.9;
}
#landing-root .hero h1 {
  font-family: var(--font);
  font-size: clamp(2.2rem, 6vw, 3.4rem);
  font-weight: 700;
  color: var(--heading);
  line-height: 1.15;
  margin-bottom: 20px;
  letter-spacing: -0.02em;
}
#landing-root .hero h1 em { font-style: normal; color: var(--amber); }
#landing-root .hero-sub {
  font-size: 1.15rem;
  color: var(--muted);
  line-height: 1.7;
  max-width: 520px;
  margin: 0 auto 36px;
}
#landing-root .hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
#landing-root .btn-primary {
  background: var(--mint);
  color: #0e0e0e;
  font-family: var(--font);
  font-size: 16px;
  font-weight: 700;
  padding: 14px 28px;
  border: none;
  border-radius: 99px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.15s, transform 0.15s;
}
#landing-root .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
#landing-root .btn-secondary {
  background: transparent;
  color: var(--text);
  font-family: var(--font);
  font-size: 16px;
  font-weight: 700;
  padding: 14px 28px;
  border: 1px solid var(--border);
  border-radius: 99px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: border-color 0.15s, transform 0.15s;
}
#landing-root .btn-secondary:hover { border-color: var(--text); transform: translateY(-1px); }
#landing-root .hero-note { font-size: 13px; color: var(--muted); }

/* ── FREE SUBJECTS STRIP ── */
#landing-root .free-subjects {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 20px;
}
#landing-root .free-subjects-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
#landing-root .free-subject-tag {
  font-size: 12px;
  font-weight: 700;
  color: var(--mint);
  background: rgba(61,217,164,0.1);
  border: 1px solid rgba(61,217,164,0.25);
  border-radius: 99px;
  padding: 3px 10px;
}
#landing-root[data-theme="light"] .free-subject-tag { background: rgba(0,120,80,0.08); }
#landing-root[data-theme="reading"] .free-subject-tag { background: rgba(0,80,50,0.08); }

/* ── TRUST BAR ── */
#landing-root .trust-bar {
  padding: 20px 24px;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  transition: var(--transition);
}
#landing-root .trust-bar-inner {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
}
#landing-root .trust-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--muted);
}
#landing-root .trust-item .dot { color: var(--mint); font-size: 18px; line-height: 1; }
#landing-root .trust-highlight {
  font-size: 14px;
  font-weight: 700;
  color: var(--mint);
  background: rgba(61,217,164,0.1);
  border: 1px solid rgba(61,217,164,0.25);
  border-radius: 99px;
  padding: 5px 14px;
}
#landing-root[data-theme="light"] .trust-highlight { background: rgba(0,120,80,0.08); }
#landing-root[data-theme="reading"] .trust-highlight { background: rgba(0,80,50,0.08); }

/* ── ACCESSIBILITY PILLS ── */
#landing-root .a11y-pills { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 28px; }
#landing-root .pill { padding: 6px 14px; border-radius: 99px; font-size: 13px; font-weight: 700; letter-spacing: 0.02em; }
#landing-root .pill-purple { background: rgba(167,139,250,0.15); color: #a78bfa; border: 1px solid rgba(167,139,250,0.3); }
#landing-root .pill-blue   { background: rgba(96,165,250,0.15);  color: #60a5fa; border: 1px solid rgba(96,165,250,0.3);  }
#landing-root .pill-amber  { background: rgba(245,166,35,0.15);  color: var(--amber); border: 1px solid rgba(245,166,35,0.3); }
#landing-root .pill-green  { background: rgba(34,197,94,0.15);   color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
#landing-root .pill-teal   { background: rgba(20,184,166,0.15);  color: #2dd4bf; border: 1px solid rgba(20,184,166,0.3); }
#landing-root .hero-hook   { font-size: 1.1rem; font-weight: 700; color: var(--mint); margin: 0 auto 0.5rem; max-width: 600px; line-height: 1.4; }
#landing-root[data-theme="light"] .pill-purple { background: rgba(109,40,217,0.08); color: #6d28d9; border-color: rgba(109,40,217,0.2); }
#landing-root[data-theme="light"] .pill-blue   { background: rgba(37,99,235,0.08);  color: #2563eb; border-color: rgba(37,99,235,0.2);  }
#landing-root[data-theme="light"] .pill-green  { background: rgba(34,197,94,0.08);  color: #15803d; border-color: rgba(34,197,94,0.2);  }
#landing-root[data-theme="light"] .pill-teal   { background: rgba(20,184,166,0.08); color: #0f766e; border-color: rgba(20,184,166,0.2); }
#landing-root[data-theme="light"] .hero-hook   { color: var(--mint); }
#landing-root[data-theme="reading"] .pill-purple { background: rgba(109,40,217,0.08); color: #6d28d9; border-color: rgba(109,40,217,0.2); }
#landing-root[data-theme="reading"] .pill-blue   { background: rgba(37,99,235,0.08);  color: #2563eb; border-color: rgba(37,99,235,0.2);  }
#landing-root[data-theme="reading"] .pill-green  { background: rgba(34,197,94,0.08);  color: #15803d; border-color: rgba(34,197,94,0.2);  }
#landing-root[data-theme="reading"] .pill-teal   { background: rgba(20,184,166,0.08); color: #0f766e; border-color: rgba(20,184,166,0.2); }

/* ── PROBLEM / SOLUTION ── */
#landing-root .problem { background: var(--surface); transition: var(--transition); }
#landing-root .section-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--amber);
  margin-bottom: 12px;
}
#landing-root .section-heading {
  font-family: var(--font);
  font-size: clamp(1.6rem, 3.5vw, 2.2rem);
  font-weight: 700;
  color: var(--heading);
  line-height: 1.25;
  margin-bottom: 16px;
  letter-spacing: -0.01em;
}
#landing-root .section-sub {
  font-size: 1rem;
  color: var(--muted);
  line-height: 1.8;
  max-width: 580px;
}

/* ── HOW IT WORKS ── */
#landing-root .how { background: var(--bg); }
#landing-root .steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 40px;
  position: relative;
}
#landing-root .steps::before {
  content: '';
  position: absolute;
  top: 28px;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(90deg, var(--mint), var(--border));
  opacity: 0.4;
}
#landing-root .step {
  text-align: center;
  padding: 28px 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  transition: var(--transition);
}
#landing-root .step-num {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--mint);
  color: #0e0e0e;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  position: relative;
  z-index: 1;
}
#landing-root .step h3 { font-size: 15px; font-weight: 700; color: var(--heading); margin-bottom: 10px; }
#landing-root .step p { font-size: 15px; color: var(--muted); line-height: 1.7; }

/* ── VIDEO PLACEHOLDER ── */
#landing-root .video-placeholder {
  margin-top: 40px;
  border: 2px dashed var(--border);
  border-radius: var(--r);
  background: var(--surface);
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  text-align: center;
  transition: var(--transition);
}
#landing-root .video-placeholder-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(61,217,164,0.12);
  border: 2px solid rgba(61,217,164,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
#landing-root .video-placeholder h3 { font-size: 16px; font-weight: 700; color: var(--heading); }
#landing-root .video-placeholder p { font-size: 14px; color: var(--muted); max-width: 340px; line-height: 1.6; }
#landing-root .video-placeholder-note {
  font-size: 12px;
  color: var(--muted);
  font-style: italic;
  opacity: 0.7;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 14px;
  background: var(--bg);
}

/* ── UNLOCK BANNER ── */
#landing-root .unlock-banner {
  background: var(--surface);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 56px 24px;
  text-align: center;
  transition: var(--transition);
}
#landing-root .unlock-heading {
  font-size: clamp(1.4rem, 3vw, 1.9rem);
  font-weight: 700;
  color: var(--heading);
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}
#landing-root .unlock-sub {
  font-size: 15px;
  color: var(--muted);
  margin-bottom: 40px;
}

/* ── COMPARISON TABLE ── */
#landing-root .comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  max-width: 700px;
  margin: 0 auto 32px;
  border: 1px solid var(--border);
  border-radius: var(--r);
  overflow: hidden;
}
#landing-root .comp-col { padding: 0; }
#landing-root .comp-col.comp-free { background: var(--bg); }
#landing-root .comp-col.comp-paid {
  background: rgba(61,217,164,0.07);
  border-left: 1px solid var(--border);
  position: relative;
}
#landing-root[data-theme="reading"] .comp-col.comp-paid { background: rgba(42,122,90,0.06); }
#landing-root .comp-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
}
#landing-root .comp-header-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 4px;
}
#landing-root .comp-header-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--heading);
  line-height: 1;
}
#landing-root .comp-col.comp-paid .comp-header-title { color: var(--mint); }
#landing-root .comp-row {
  padding: 12px 24px;
  font-size: 14px;
  color: var(--text);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 10px;
  line-height: 1.4;
}
#landing-root .comp-row:last-child { border-bottom: none; }
#landing-root .comp-row .icon { flex-shrink: 0; font-size: 15px; }
#landing-root .comp-row.muted-row { color: var(--muted); }
#landing-root .comp-row.muted-row .icon { opacity: 0.4; }
#landing-root .comp-row strong { color: var(--text); }

/* ── SCROLLING QUOTES ── */
#landing-root .quotes-section {
  background: var(--amber);
  padding: 56px 0;
  overflow: hidden;
  position: relative;
}
#landing-root[data-theme="reading"] .quotes-section { background: var(--surface2); border-top: 2px solid var(--border); border-bottom: 2px solid var(--border); }
#landing-root .quotes-track-wrapper { overflow: hidden; width: 100%; }
#landing-root .quotes-track {
  display: flex;
  gap: 24px;
  width: max-content;
  animation: scroll-quotes 22s linear infinite;
}
#landing-root .quotes-track:hover { animation-play-state: paused; }
@keyframes scroll-quotes {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
#landing-root .quote-card {
  background: rgba(255,255,255,0.18);
  border-radius: 16px;
  padding: 28px 32px;
  min-width: 380px;
  max-width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
#landing-root[data-theme="reading"] .quote-card { background: var(--surface); border: 1px solid var(--border); }
#landing-root .quote-problem { font-size: 15px; font-weight: 700; color: rgba(14,14,14,0.75); font-style: italic; }
#landing-root[data-theme="reading"] .quote-problem { color: var(--muted); }
#landing-root .quote-answer { font-size: 16px; font-weight: 700; color: #0e0e0e; }
#landing-root[data-theme="reading"] .quote-answer { color: var(--heading); }
#landing-root .quote-answer strong { color: #0e0e0e; }
#landing-root[data-theme="reading"] .quote-answer strong { color: var(--mint); }
#landing-root .quote-attribution {
  font-size: 12px;
  font-weight: 700;
  color: rgba(14,14,14,0.5);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-top: 4px;
}
#landing-root[data-theme="reading"] .quote-attribution { color: var(--muted); }

/* ── PRICING ── */
#landing-root .pricing { background: var(--bg); }
#landing-root .pricing-social-proof {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(61,217,164,0.1);
  border: 1px solid rgba(61,217,164,0.25);
  border-radius: 99px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 700;
  color: var(--mint);
  margin-bottom: 16px;
}
#landing-root[data-theme="light"] .pricing-social-proof { background: rgba(0,120,80,0.08); }
#landing-root[data-theme="reading"] .pricing-social-proof { background: rgba(0,80,50,0.08); }
#landing-root .pricing-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 40px;
}
#landing-root .pricing-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 32px 28px;
  transition: var(--transition);
}
#landing-root .pricing-card.featured { border-color: var(--mint); position: relative; }
#landing-root .featured-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--mint);
  color: #0e0e0e;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 99px;
  white-space: nowrap;
}
#landing-root .pricing-tier {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 8px;
}
#landing-root .pricing-price {
  font-size: 2.6rem;
  font-weight: 700;
  color: var(--heading);
  line-height: 1;
  margin-bottom: 4px;
}
#landing-root .pricing-price sup { font-size: 1.2rem; vertical-align: super; }
#landing-root .pricing-desc { font-size: 14px; color: var(--muted); margin-bottom: 24px; line-height: 1.6; }
#landing-root .pricing-features { list-style: none; margin-bottom: 28px; }
#landing-root .pricing-features li {
  font-size: 14px;
  color: var(--text);
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 10px;
}
#landing-root .pricing-features li:last-child { border-bottom: none; }
#landing-root .pricing-features li .check { color: var(--mint); font-weight: 700; flex-shrink: 0; }
#landing-root .pricing-features li .cross { color: var(--muted); flex-shrink: 0; }
#landing-root .pricing-cta {
  display: block;
  width: 100%;
  text-align: center;
  padding: 14px;
  border-radius: 99px;
  font-family: var(--font);
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s;
  border: none;
}
#landing-root .pricing-cta:hover { opacity: 0.85; transform: translateY(-1px); }
#landing-root .pricing-cta.primary { background: var(--mint); color: #0e0e0e; }
#landing-root .pricing-cta.secondary { background: transparent; color: var(--text); border: 1px solid var(--border); }

/* ── FOOTER ── */
#landing-root footer {
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 28px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  transition: var(--transition);
}
#landing-root .footer-brand { font-size: 15px; font-weight: 700; color: var(--muted); }
#landing-root .footer-brand em { color: var(--amber); font-style: normal; }
#landing-root .footer-links { display: flex; gap: 20px; list-style: none; }
#landing-root .footer-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color 0.15s; }
#landing-root .footer-links a:hover { color: var(--text); }
#landing-root .footer-copy { font-size: 12px; color: var(--muted); }

/* ── REVEAL ANIMATIONS ── */
#landing-root .reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.55s ease, transform 0.55s ease;
}
#landing-root .reveal.visible { opacity: 1; transform: translateY(0); }

/* ── RESPONSIVE ── */
@media (max-width: 700px) {
  #landing-root .pricing-grid { grid-template-columns: 1fr; }
  #landing-root .steps { grid-template-columns: 1fr; }
  #landing-root .steps::before { display: none; }
  #landing-root .topbar { padding: 0 16px; }
  #landing-root .theme-btn { padding: 4px 8px; font-size: 11px; }
  #landing-root .nav-signin { display: none; }
  #landing-root section { padding: 56px 16px; }
  #landing-root .hero { padding: 56px 16px; }
  #landing-root .trust-bar-inner { flex-direction: column; align-items: flex-start; gap: 12px; }
  #landing-root .quote-card { min-width: 280px; max-width: 280px; padding: 20px 20px; }
  #landing-root .comparison-grid { grid-template-columns: 1fr; }
  #landing-root .comp-col.comp-paid { border-left: none; border-top: 1px solid var(--border); }
}
`;

const js = `
(function() {
  function setTheme(theme) {
    var root = document.getElementById('landing-root');
    if (!root) return;
    root.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-theme-btn]').forEach(function(btn) {
      var isActive = btn.getAttribute('data-theme-btn') === theme;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  document.querySelectorAll('[data-theme-btn]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      setTheme(this.getAttribute('data-theme-btn'));
    });
  });

  var revealEls = document.querySelectorAll('#landing-root .reveal');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(function(el) { observer.observe(el); });
})();
`;

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const reviseHref = user ? '/dashboard' : '/login';

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div id="landing-root" data-theme="dark">

        {/* TOPBAR */}
        <header className="topbar">
          <a className="topbar-brand" href="/">
            <div className="brand-logo">
              {/* Logo image goes here */}
            </div>
            <span className="brand-name">Revision <em>Breakdown</em></span>
          </a>
          <div className="topbar-right">
            <div className="theme-btns" role="group" aria-label="Choose display theme">
              <button className="theme-btn active" data-theme-btn="dark" aria-pressed="true">Dark</button>
              <button className="theme-btn" data-theme-btn="light" aria-pressed="false">Light</button>
              <button className="theme-btn" data-theme-btn="reading" aria-pressed="false">Reading</button>
            </div>
            <a href="/login" className="nav-signin">Sign in</a>
          </div>
        </header>

        {/* HERO */}
        <section className="hero" id="home">
          <div className="hero-inner">
            <div className="hero-logo">
              {/* Logo image goes here */}
            </div>
            <div className="hero-eyebrow">Free to try · No sign-up needed</div>
            <h1>Avoid falling apart in the exams — <em>do the simple things right.</em></h1>
            <p className="hero-hook">Most students lose marks on questions they actually know the answer to.</p>
            <p className="hero-sub">Revision Breakdown teaches students the vocabulary that unlocks exam questions.</p>
            <div className="hero-actions">
              <a href={reviseHref} className="btn-primary">
                Try a free topic
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
              <a href="#pricing" className="btn-secondary">
                Unlock everything — £5
              </a>
            </div>
            <p className="hero-note">No account needed. No subscription. Try free, pay £5 to unlock everything.</p>
            <div className="free-subjects">
              <span className="free-subjects-label">Free topics:</span>
              <span className="free-subject-tag">English Language</span>
              <span className="free-subject-tag">Maths</span>
              <span className="free-subject-tag">Biology</span>
              <span className="free-subject-tag">Music</span>
              <span className="free-subject-tag">Geography</span>
            </div>
          </div>
        </section>

        {/* TRUST BAR */}
        <div className="trust-bar">
          <div className="trust-bar-inner">
            <div className="trust-item"><span className="dot">●</span> Tested in real classrooms</div>
            <div className="trust-item"><span className="dot">●</span> Supports everyone from Grade 1 to 9</div>
            <div className="trust-item"><span className="dot">●</span> Reads tricky words out loud</div>
            <span className="trust-highlight">Used by 200+ students and their parents</span>
          </div>
        </div>

        {/* PROBLEM */}
        <section className="problem" id="problem">
          <div className="inner">
            <div className="reveal">
              <p className="section-label">The problem</p>
              <h2 className="section-heading">Revising doesn&apos;t have to be hard.</h2>
              <p className="section-sub">Most students struggle not because the content is too hard — but because they don&apos;t know what the keywords mean. Fix the keywords, unlock the questions.</p>
              <div className="a11y-pills">
                <span className="pill pill-purple">Dyslexia Friendly</span>
                <span className="pill pill-blue">ADHD Friendly</span>
                <span className="pill pill-amber">Read-Aloud Support</span>
                <span className="pill pill-green">Tested in Classrooms</span>
                <span className="pill pill-teal">Made by an Experienced Teacher</span>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how" id="how">
          <div className="inner">
            <div className="reveal">
              <p className="section-label">How it works</p>
              <h2 className="section-heading">Three steps. Zero faff.</h2>
              <p className="section-sub">Pick a subject, pick a topic, start revising. Every question reads itself aloud if you need it to.</p>
            </div>
            <div className="steps reveal">
              <div className="step">
                <div className="step-num">1</div>
                <h3>Pick your subject &amp; board</h3>
                <p>Choose from AQA, Edexcel, OCR, or Eduqas. Science students can pick combined or separate.</p>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <h3>Choose a topic</h3>
                <p>Start with a free topic — or unlock all 113. Work through flashcards, multiple choice, true/false, and fill-in-the-blank.</p>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <h3>Keep your streak going</h3>
                <p>Track what you&apos;ve done, come back tomorrow, and watch the gaps close before the exams.</p>
              </div>
            </div>

            {/* VIDEO PLACEHOLDER */}
            <div className="video-placeholder reveal">
              <div className="video-placeholder-icon">▶</div>
              <h3>See it in action</h3>
              <p>A short screen recording showing the flashcard flip, read-aloud, and question types will go here.</p>
              <span className="video-placeholder-note">Video placeholder — replace with a 15–20 second looping clip</span>
            </div>
          </div>
        </section>

        {/* UNLOCK BANNER */}
        <div className="unlock-banner reveal">
          <h2 className="unlock-heading">What unlocks for £5</h2>
          <p className="unlock-sub">Less than a revision guide. One payment. No subscription. Nothing to cancel.</p>

          <div className="comparison-grid">
            {/* FREE COLUMN */}
            <div className="comp-col comp-free">
              <div className="comp-header">
                <div className="comp-header-label">Currently free</div>
                <div className="comp-header-title">£0</div>
              </div>
              <div className="comp-row"><span className="icon">✓</span> 5 free topics</div>
              <div className="comp-row"><span className="icon">✓</span> English Language, Maths, Biology, Music, Geography</div>
              <div className="comp-row"><span className="icon">✓</span> Flashcards, MCQ, true/false</div>
              <div className="comp-row"><span className="icon">✓</span> Read-aloud on all questions</div>
              <div className="comp-row muted-row"><span className="icon">–</span> 108 more topics locked</div>
              <div className="comp-row muted-row"><span className="icon">–</span> 28 more subjects locked</div>
              <div className="comp-row muted-row"><span className="icon">–</span> Exam board selection locked</div>
              <div className="comp-row muted-row"><span className="icon">–</span> Streak tracker locked</div>
            </div>
            {/* PAID COLUMN */}
            <div className="comp-col comp-paid">
              <div className="comp-header">
                <div className="comp-header-label">Full access</div>
                <div className="comp-header-title">£5</div>
              </div>
              <div className="comp-row"><span className="icon" style={{color:'var(--mint)'}}>✓</span> <strong>All 113 topics</strong></div>
              <div className="comp-row"><span className="icon" style={{color:'var(--mint)'}}>✓</span> <strong>All 33 subjects</strong></div>
              <div className="comp-row"><span className="icon" style={{color:'var(--mint)'}}>✓</span> <strong>All 4 question types</strong></div>
              <div className="comp-row"><span className="icon" style={{color:'var(--mint)'}}>✓</span> <strong>Read-aloud on everything</strong></div>
              <div className="comp-row"><span className="icon" style={{color:'var(--mint)'}}>✓</span> <strong>AQA, Edexcel, OCR &amp; Eduqas</strong></div>
              <div className="comp-row"><span className="icon" style={{color:'var(--mint)'}}>✓</span> <strong>All 33 subjects</strong></div>
              <div className="comp-row"><span className="icon" style={{color:'var(--mint)'}}>✓</span> <strong>Save your exam board &amp; topics</strong></div>
              <div className="comp-row"><span className="icon" style={{color:'var(--mint)'}}>✓</span> <strong>Streak tracker</strong></div>
            </div>
          </div>

          <a href="#pricing" className="btn-primary" style={{display:'inline-flex'}}>Unlock everything for £5 →</a>
        </div>

        {/* SCROLLING QUOTES */}
        <div className="quotes-section">
          <div className="quotes-track-wrapper">
            <div className="quotes-track" id="quotesTrack">
              <div className="quote-card">
                <p className="quote-problem">&quot;I don&apos;t know where to start&quot;</p>
                <p className="quote-answer">Start here with <strong>RB.</strong></p>
                <p className="quote-attribution">Year 10 student</p>
              </div>
              <div className="quote-card">
                <p className="quote-problem">&quot;What do they mean &apos;Put more detail in&apos;&quot;</p>
                <p className="quote-answer"><strong>Keywords are the details.</strong></p>
                <p className="quote-attribution">Year 11 student</p>
              </div>
              <div className="quote-card">
                <p className="quote-problem">&quot;I know what it is, I just don&apos;t get the question&quot;</p>
                <p className="quote-answer"><strong>RB unlocks the questions.</strong></p>
                <p className="quote-attribution">Year 10 student</p>
              </div>
              <div className="quote-card">
                <p className="quote-problem">&quot;I opened a revision guide and just felt lost&quot;</p>
                <p className="quote-answer">This was <strong>made for you.</strong></p>
                <p className="quote-attribution">Year 11 student</p>
              </div>
              <div className="quote-card">
                <p className="quote-problem">&quot;They revise but it just doesn&apos;t stick&quot;</p>
                <p className="quote-answer"><strong>One keyword at a time.</strong> It will stick.</p>
                <p className="quote-attribution">Parent of a Year 10 student</p>
              </div>
              <div className="quote-card">
                <p className="quote-problem">&quot;They panic about every subject&quot;</p>
                <p className="quote-answer">This <strong>breaks it into pieces</strong> they can manage.</p>
                <p className="quote-attribution">Parent of a Year 11 student</p>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="quote-card">
                <p className="quote-problem">&quot;I don&apos;t know where to start&quot;</p>
                <p className="quote-answer">Start here with <strong>RB.</strong></p>
                <p className="quote-attribution">Year 10 student</p>
              </div>
              <div className="quote-card">
                <p className="quote-problem">&quot;What do they mean &apos;Put more detail in&apos;&quot;</p>
                <p className="quote-answer"><strong>Keywords are the details.</strong></p>
                <p className="quote-attribution">Year 11 student</p>
              </div>
              <div className="quote-card">
                <p className="quote-problem">&quot;I know what it is, I just don&apos;t get the question&quot;</p>
                <p className="quote-answer"><strong>RB unlocks the questions.</strong></p>
                <p className="quote-attribution">Year 10 student</p>
              </div>
              <div className="quote-card">
                <p className="quote-problem">&quot;I opened a revision guide and just felt lost&quot;</p>
                <p className="quote-answer">This was <strong>made for you.</strong></p>
                <p className="quote-attribution">Year 11 student</p>
              </div>
              <div className="quote-card">
                <p className="quote-problem">&quot;They revise but it just doesn&apos;t stick&quot;</p>
                <p className="quote-answer"><strong>One keyword at a time.</strong> It will stick.</p>
                <p className="quote-attribution">Parent of a Year 10 student</p>
              </div>
              <div className="quote-card">
                <p className="quote-problem">&quot;They panic about every subject&quot;</p>
                <p className="quote-answer">This <strong>breaks it into pieces</strong> they can manage.</p>
                <p className="quote-attribution">Parent of a Year 11 student</p>
              </div>
            </div>
          </div>
        </div>

        {/* PRICING */}
        <section className="pricing" id="pricing">
          <div className="inner">
            <div className="reveal">
              <div className="pricing-social-proof">
                <span>★</span> Used by 200+ students and their parents
              </div>
              <p className="section-label">Pricing</p>
              <h2 className="section-heading">£5. Once. Done.</h2>
              <p className="section-sub">Less than a revision guide. No monthly fee. Cancel nothing.</p>
            </div>
            <div className="pricing-grid">
              {/* FREE */}
              <div className="pricing-card reveal">
                <p className="pricing-tier">Free</p>
                <div className="pricing-price">£0</div>
                <p className="pricing-desc">Try it now — no sign-up needed. One topic each for English Language, Maths, Biology, Music &amp; Geography.</p>
                <ul className="pricing-features">
                  <li><span className="check">✓</span> Flashcards, multiple choice, true/false</li>
                  <li><span className="check">✓</span> Read-aloud on all questions</li>
                  <li><span className="check">✓</span> 5 free topics across 5 subjects</li>
                  <li><span className="cross">–</span> 108 more topics locked</li>
                  <li><span className="cross">–</span> 28 more subjects locked</li>
                  <li><span className="cross">–</span> AQA, Edexcel, OCR &amp; Eduqas locked</li>
                  <li><span className="cross">–</span> Streak tracker &amp; saved preferences locked</li>
                </ul>
                <a href={reviseHref} className="pricing-cta secondary">Try a free topic →</a>
              </div>
              {/* FULL ACCESS */}
              <div className="pricing-card featured reveal">
                <div className="featured-badge">Best value</div>
                <p className="pricing-tier">Full Access</p>
                <div className="pricing-price"><sup>£</sup>5</div>
                <p className="pricing-desc">One payment. Everything unlocked until your last exam. Less than a revision guide. No subscription.</p>
                <ul className="pricing-features">
                  <li><span className="check">✓</span> Flashcards, multiple choice, true/false</li>
                  <li><span className="check">✓</span> Read-aloud on all questions</li>
                  <li><span className="check">✓</span> <strong>All 113 topics</strong></li>
                  <li><span className="check">✓</span> <strong>All 33 subjects</strong></li>
                  <li><span className="check">✓</span> <strong>AQA, Edexcel, OCR &amp; Eduqas</strong></li>
                  <li><span className="check">✓</span> <strong>Streak tracker</strong></li>
                  <li><span className="check">✓</span> <strong>Save your exam board &amp; topics</strong></li>
                </ul>
                <a href="/upgrade" className="pricing-cta primary">Unlock everything — £5</a>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <span className="footer-brand">Revision <em>Breakdown</em></span>
          <ul className="footer-links">
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy">Privacy</a></li>
          </ul>
          <span className="footer-copy">© 2025 Revision Breakdown</span>
        </footer>

      </div>

      <Script
        id="landing-js"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: js }}
      />
    </>
  );
}
