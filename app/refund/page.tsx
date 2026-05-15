import LegalPage, { Section } from '@/components/legal/LegalPage'

export const metadata = {
  title: 'Refund Policy — Revision Breakdown',
  description: 'Our refund policy for Revision Breakdown purchases.',
}

export default function RefundPage() {
  return (
    <LegalPage title="Refund Policy" label="Simple and fair">
      <Section>
        <p>We want Revision Breakdown to work for every student who uses it. If something goes wrong, we will put it right.</p>
      </Section>
      <Section heading="What we will always refund">
        <p>If your student code was not delivered after payment, contact us and we will resend it immediately or issue a full refund — your choice.</p>
        <p>If a technical problem on our side stops the app from working and we cannot fix it within a reasonable time, we will issue a full refund.</p>
      </Section>
      <Section heading="What we do not refund">
        <p>Because Revision Breakdown is a digital product and access is granted immediately on purchase, we do not offer refunds on the basis of a change of mind. We do not offer refunds because exam results did not improve — we are a revision aid, not a guarantee.</p>
      </Section>
      <Section heading="How to request a refund">
        <p>Email <a href="mailto:revisionbreakdown@gmail.com">revisionbreakdown@gmail.com</a> with the subject line <strong>Refund Request</strong> and include your order confirmation details. We aim to respond within 48 hours.</p>
      </Section>
    </LegalPage>
  )
}
