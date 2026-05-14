import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

const FREE_SUBJECTS = [
  { subjectId: '813b5fdc-8020-4978-81f2-e9d498bed54f', name: 'English Language', topicId: 'f4289169-82b1-41c1-8b6d-cc8f61e9aaa8', topicName: 'Reading — Fiction & Literary Non-Fiction' },
  { subjectId: '1f37d924-d678-46ec-b3a4-5d973455e0eb', name: 'English Literature', topicId: '59283ba2-7862-4daf-a6d4-a3cf694132f5', topicName: 'An Inspector Calls' },
  { subjectId: '9694cb29-cfb2-4b9d-b517-ce230936152e', name: 'History', topicId: '01503f0a-cb23-4fe7-a865-9d68bd683262', topicName: 'Medicine Through Time' },
  { subjectId: '32f9f399-0a0e-4e8a-b2c6-19ba538493a2', name: 'Computer Science', topicId: 'f24456bd-60a0-4eb5-9243-5fb3fe6331a0', topicName: 'Systems Architecture' },
  { subjectId: 'b75f5a42-e078-485d-b910-2ccea6a8ff09', name: 'Business Studies', topicId: '2f89226b-2a7c-42b6-80f7-937bce050251', topicName: 'Business in the Real World' },
  { subjectId: '3735e027-1de9-4ae7-a53b-4907ef0f6482', name: 'Physical Education', topicId: '480cb1c4-76f6-41c8-8fb3-0c3e54573e90', topicName: 'Applied Anatomy & Physiology' },
];

const FREE_TOPIC_IDS = FREE_SUBJECTS.map((s) => s.topicId);

export default async function FreePage() {
  const supabase = await createClient();

  const { data: blockRows } = await supabase
    .from('blocks')
    .select('id, block_name, block_number, topic_id')
    .in('topic_id', FREE_TOPIC_IDS)
    .order('block_number', { ascending: true });

  const allBlocks = blockRows ?? [];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 font-bold text-[17px] no-underline text-foreground"
          >
            Revision <span className="text-[#f5a623]">Breakdown</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Free Topics</h1>
          <p className="mt-3 text-muted-foreground">
            Try a full topic from each of these subjects — no account needed.
          </p>
        </div>

        <div className="space-y-8">
          {FREE_SUBJECTS.map((subject) => {
            const blocks = allBlocks.filter((b) => b.topic_id === subject.topicId);
            return (
              <div key={subject.subjectId} className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-xl font-bold tracking-tight">{subject.name}</h2>
                <span className="mt-2 mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {subject.topicName}
                </span>
                {blocks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No blocks available yet.</p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {blocks.map((block) => (
                      <li key={block.id} className="flex flex-col gap-2 py-2">
                        <span className="text-sm font-medium">{block.block_name}</span>
                        <div className="flex flex-wrap gap-1.5">
                          <Link href={`/block/${block.id}/flashcards`}     className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-blue-500   hover:bg-blue-600   text-white transition-colors">Flashcards</Link>
                          <Link href={`/block/${block.id}/mcq`}            className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-purple-500 hover:bg-purple-600 text-white transition-colors">MCQ</Link>
                          <Link href={`/block/${block.id}/truefalse`}      className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-green-500  hover:bg-green-600  text-white transition-colors">True / False</Link>
                          <Link href={`/block/${block.id}/fillintheblank`} className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors">Fill in the Blank</Link>
                          <Link href={`/block/${block.id}/matchup`}        className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-pink-500   hover:bg-pink-600   text-white transition-colors">Match-Up</Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-lg font-bold tracking-tight mb-4">
            Want access to all 33 subjects and 113 topics?
          </p>
          <Link
            href="/upgrade"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Unlock everything — £5
          </Link>
        </div>
      </div>
    </main>
  );
}
