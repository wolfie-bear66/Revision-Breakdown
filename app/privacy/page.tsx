import LegalPage, { Section } from '@/components/legal/LegalPage'

export const metadata = {
  title: 'Privacy Policy — Revision Breakdown',
  description: 'What data we collect, why we collect it, and how long we keep it.',
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" label="Last updated: May 2025">
      <Section>
        <p>This policy explains what personal data Revision Breakdown collects, why we collect it, and what we do with it. It applies to the Revision Breakdown website and app at revisionbreakdown.co.uk.</p>
        <p>Revision Breakdown is operated by Stuart Yates, trading as Revision Breakdown. We are the data controller for the purposes of UK GDPR. Contact: <a href="mailto:revisionbreakdown@gmail.com">revisionbreakdown@gmail.com</a></p>
      </Section>
      <Section heading="1. What data we collect">
        <p><strong>When a parent buys access:</strong> name, email address, and payment details. Payment is handled by Stripe — we never see or store your full card number.</p>
        <p><strong>When a student uses the app:</strong> a student account is created using only a unique access code (RB-XXXX-XXXX). No student email address is collected or stored.</p>
        <p><strong>Usage data:</strong> which subjects, topics, and question types are used; session scores; and timestamps. This is used to show progress within the app.</p>
        <p><strong>Technical data:</strong> IP addresses, browser type, and device type may be logged by our hosting provider (Vercel) and authentication provider (Supabase) for security and performance purposes.</p>
      </Section>
      <Section heading="2. Why we collect it">
        <table>
          <thead><tr><th>Data</th><th>Purpose</th><th>Legal basis</th></tr></thead>
          <tbody>
            <tr><td>Parent email and name</td><td>Delivering the student code; account management</td><td>Contract</td></tr>
            <tr><td>Payment data</td><td>Processing the payment via Stripe</td><td>Contract</td></tr>
            <tr><td>Usage and progress data</td><td>Showing the student their progress</td><td>Contract</td></tr>
            <tr><td>Technical/log data</td><td>Security and service reliability</td><td>Legitimate interests</td></tr>
          </tbody>
        </table>
      </Section>
      <Section heading="3. Cookies">
        <p>We use essential cookies only. <strong>Authentication cookies</strong> are set by Supabase to keep you logged in. We do not use advertising cookies, tracking cookies, or third-party analytics cookies.</p>
      </Section>
      <Section heading="4. Who we share data with">
        <p><strong>Stripe</strong> — payment processing (stripe.com/gb/privacy)</p>
        <p><strong>Supabase</strong> — database and authentication, servers in the EU (supabase.com/privacy)</p>
        <p><strong>Vercel</strong> — hosting (vercel.com/legal/privacy-policy)</p>
        <p><strong>Resend</strong> — email delivery (resend.com/legal/privacy-policy)</p>
        <p>We do not sell your data. We do not share it with advertisers.</p>
      </Section>
      <Section heading="5. How long we keep data">
        <p><strong>Parent and student account data:</strong> kept until 31 August 2026, then deleted within 90 days unless you request earlier deletion.</p>
        <p><strong>Payment records:</strong> kept for 7 years as required by HMRC.</p>
      </Section>
      <Section heading="6. Your rights">
        <p>Under UK GDPR you have the right to access, correct, or delete the data we hold about you. Email <a href="mailto:revisionbreakdown@gmail.com">revisionbreakdown@gmail.com</a> with the subject line <strong>Data Request</strong> and we will respond within 30 days.</p>
        <p>You can also complain to the Information Commissioner's Office at ico.org.uk.</p>
      </Section>
      <Section heading="7. Changes to this policy">
        <p>We may update this policy from time to time. If we make a significant change we will email you.</p>
      </Section>
    </LegalPage>
  )
}
