import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

const FREE_SUBJECTS = [
  { subjectId: '15232b38-e5ee-4b12-a5ae-c2427daa81fc', name: 'Maths', topicId: 'aaf5de10-fb13-400a-8528-0177b3808f5f', topicName: 'Number' },
  { subjectId: '813b5fdc-8020-4978-81f2-e9d498bed54f', name: 'English Language', topicId: 'f4289169-82b1-41c1-8b6d-cc8f61e9aaa8', topicName: 'Reading — Fiction & Literary Non-Fiction' },
  { subjectId: '1f37d924-d678-46ec-b3a4-5d973455e0eb', name: 'English Literature', topicId: '59283ba2-7862-4daf-a6d4-a3cf694132f5', topicName: 'An Inspector Calls — Priestley' },
  { subjectId: '83bd5f93-be55-4ed6-8208-2007897e1b44', name: 'Biology', topicId: '8a9b7e5d-c3b7-4493-91f1-c8ff10cb0b72', topicName: 'Cell Biology' },
  { subjectId: 'abf947ff-1638-4e14-bb7b-b319e4eb7675', name: 'Geography', topicId: '9405f0d2-cf38-462a-9d05-d50b06882105', topicName: 'Hazardous Earth' },
  { subjectId: 'db3d132d-bcc3-40c0-9c8a-2f8aceb450aa', name: 'Music', topicId: '01620aaa-38d7-454b-8d1a-d82a64d2e13e', topicName: 'Musical Elements & Concepts' },
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
                      <li key={block.id}>
                        <Link
                          href={`/block/${block.id}/flashcards`}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <span className="text-muted-foreground text-xs w-5 shrink-0">{block.block_number}</span>
                          {block.block_name}
                        </Link>
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
