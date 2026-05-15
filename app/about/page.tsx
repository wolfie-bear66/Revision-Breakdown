import LegalPage, { Section } from '@/components/legal/LegalPage'

export const metadata = {
  title: 'About — Revision Breakdown',
  description: 'Made by a teacher, for students who find revision hard.',
}

export default function AboutPage() {
  return (
    <LegalPage title="About Revision Breakdown" label="Who we are">
      <Section>
        <p>Revision Breakdown was built by Stuart Yates, a teacher who has spent years watching students struggle not because the content is too hard — but because they do not know what the keywords mean.</p>
        <p>Before this, I ran a free revision site called The Revision Hub, used by students in my own school. Revision Breakdown is the next version: cleaner, wider, and built so that any student — not just the ones I teach — can use it.</p>
      </Section>
      <Section heading="Why keywords?">
        <p>Most exam questions test whether you know the vocabulary of a subject. If you do not know what osmosis means, or what juxtaposition is, or what opportunity cost refers to — you cannot answer the question, even if you understand the idea.</p>
        <p>Revision Breakdown breaks every subject into blocks of ten keywords at a time. Flashcards first, then questions. Simple, fast, and designed so that doing fifteen minutes actually feels like progress.</p>
      </Section>
      <Section heading="Built for everyone">
        <p>The app uses Atkinson Hyperlegible — a font designed specifically for readers with low vision and dyslexia. Every question can be read aloud. The interface is clean, with no adverts, no distractions, and no dark patterns.</p>
        <p>It has been tested with real students, including students with dyslexia, ADHD, and low reading confidence. It is not a perfect tool, but it is an honest one.</p>
      </Section>
      <Section heading="Who is behind it?">
        <p>Revision Breakdown is run by Stuart Yates, trading as Revision Breakdown. It is a solo project. If you have a question, a problem, or a suggestion, I will read it and reply.</p>
        <p>Contact: <a href="mailto:revisionbreakdown@gmail.com">revisionbreakdown@gmail.com</a></p>
      </Section>
    </LegalPage>
  )
}
