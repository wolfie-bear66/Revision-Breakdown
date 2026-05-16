import LegalPage, { Section, ContactCard } from '@/components/legal/LegalPage'

export const metadata = {
  title: 'Contact — Revision Breakdown',
  description: 'Get in touch with the Revision Breakdown team.',
}

export default function ContactPage() {
  return (
    <LegalPage title="Contact us" label="Get in touch">
      <Section>
        <p>Whether you have a question about your subscription, a problem with the app, or a suggestion — get in touch and I will get back to you as quickly as I can, usually within 48 hours.</p>
      </Section>
      <ContactCard />
      <Section heading="Data and privacy requests">
        <p>If you want to access, correct, or delete the personal data we hold about you, email the address above with the subject line <strong>Data Request</strong>. We will respond within 30 days as required under UK GDPR.</p>
      </Section>
      <Section heading="Refunds">
        <p>If you have a problem with your purchase, email us with your order details and we will sort it out. See our <a href="/terms">Terms of Service</a> for the full refund policy.</p>
      </Section>
    </LegalPage>
  )
}
