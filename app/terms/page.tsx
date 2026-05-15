import LegalPage, { Section } from '@/components/legal/LegalPage'

export const metadata = {
  title: 'Terms of Service — Revision Breakdown',
  description: 'What you are buying, how long it lasts, and what to do if something goes wrong.',
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" label="Last updated: May 2025">
      <Section>
        <p>These terms apply when you purchase access to Revision Breakdown. Please read them before buying. By completing a purchase you agree to these terms.</p>
        <p>Revision Breakdown is operated by Stuart Yates, trading as Revision Breakdown. Contact: <a href="mailto:revisionbreakdown@gmail.com">revisionbreakdown@gmail.com</a></p>
      </Section>
      <Section heading="1. What you are buying">
        <p>A one-off payment of £5 gives a single student access to the full Revision Breakdown app — all 33 subjects, all 113 topics, all question types, and all exam boards (AQA, Edexcel, OCR, Eduqas).</p>
        <p>Access is provided to one student account and one parent account. The student account is accessed using a unique code (format: RB-XXXX-XXXX) that we send to the parent email address after payment.</p>
      </Section>
      <Section heading="2. How long access lasts">
        <p>Access runs until <strong>31 August 2026</strong>. This covers the full GCSE examination period and results day. No renewal is needed and no subscription will be charged.</p>
        <p>If you purchase after 31 August 2026, a new end date will be displayed clearly before checkout.</p>
      </Section>
      <Section heading="3. Your right to cancel">
        <p>Under the UK Consumer Contracts Regulations 2013, you normally have 14 days to cancel a digital purchase. However, this right does not apply once the digital content has been delivered and you have confirmed you want immediate access.</p>
        <p>By completing your purchase you confirm that you want immediate access to Revision Breakdown and acknowledge that your right to cancel ends once access has been provided.</p>
        <p>This does not affect your rights if something goes wrong — see section 4.</p>
      </Section>
      <Section heading="4. Refunds">
        <p>If you experience a technical problem that stops you using the service, or if access was not delivered correctly, contact us at <a href="mailto:revisionbreakdown@gmail.com">revisionbreakdown@gmail.com</a> and we will put it right — including issuing a refund if we cannot fix the problem.</p>
        <p>We do not offer refunds on the basis of a change of mind once access has been granted.</p>
      </Section>
      <Section heading="5. What we provide">
        <p>We will make reasonable efforts to keep Revision Breakdown available and up to date. Content covers the major GCSE exam boards. We make every effort to keep content accurate, but we cannot guarantee that every question reflects the most recent specification changes.</p>
      </Section>
      <Section heading="6. Your account">
        <p>You are responsible for keeping your student code confidential. Access is licensed for one student only. We reserve the right to suspend access if an account is being shared or misused.</p>
      </Section>
      <Section heading="7. Children and parental consent">
        <p>Revision Breakdown is designed for students aged 14-16. The purchase is made by a parent or guardian. We do not knowingly collect personal data from children under 13 without parental consent.</p>
      </Section>
      <Section heading="8. Limitation of liability">
        <p>Revision Breakdown is a revision aid. We make no guarantee of exam results. Our liability to you is limited to the amount you paid for access.</p>
      </Section>
      <Section heading="9. Changes to these terms">
        <p>We may update these terms from time to time. If we make a significant change we will email you. Continuing to use the service after a change means you accept the updated terms.</p>
      </Section>
      <Section heading="10. Governing law">
        <p>These terms are governed by the law of England and Wales.</p>
      </Section>
    </LegalPage>
  )
}
