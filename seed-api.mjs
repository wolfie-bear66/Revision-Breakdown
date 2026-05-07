import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  'https://ejvivqhtrnwfijtbarxq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdml2cWh0cm53ZmlqdGJhcnhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk5MjQzMSwiZXhwIjoyMDkzNTY4NDMxfQ.o49R2O1hEENB1XiIIzEf9gDI1ACMYQ2NLBjPh7nIVZI'
);

const args = process.argv.slice(2);
const contentDir = join(__dirname, 'content');
const files = args[0]
  ? [args[0]]
  : readdirSync(contentDir).filter(f => f.endsWith('-full.json')).map(f => join(contentDir, f));

async function upsert(table, rows) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`${table}: ${error.message}`);
}

async function seedSubject(filePath) {
  const data = JSON.parse(readFileSync(filePath, 'utf8'));
  const { subject, topics } = data;

  // Derive unique slug from filename (e.g. biology-aqa-full.json → biology-aqa)
  const slug = basename(filePath).replace(/-full\.json$/, '');

  console.log(`\n📘 Seeding: ${subject.name} (${subject.exam_board}) [${slug}]`);

  // Subject — check if exists first
  let subjectId;
  const { data: existing } = await supabase.from('subjects').select('id').eq('slug', slug).maybeSingle();
  if (existing) {
    console.log(`  ⏭️  Already exists, skipping.`);
    return;
  }
  const { data: inserted, error: subjectErr } = await supabase
    .from('subjects')
    .insert({ name: subject.name, slug, colour: subject.colour, exam_board: subject.exam_board, emoji: subject.emoji })
    .select('id')
    .single();
  if (subjectErr) throw new Error(`subjects: ${subjectErr.message}`);
  subjectId = inserted.id;

  let totalBlocks = 0, totalCards = 0, totalQuestions = 0;

  for (const topic of topics) {
    const { data: topicRow, error: topicErr } = await supabase
      .from('topics')
      .insert({ subject_id: subjectId, name: topic.name, paper: topic.paper ?? null, display_order: topic.display_order })
      .select('id')
      .single();
    if (topicErr) throw new Error(`topics: ${topicErr.message}`);
    const topicId = topicRow.id;

    for (const block of topic.blocks) {
      const { data: blockRow, error: blockErr } = await supabase
        .from('blocks')
        .insert({ topic_id: topicId, block_number: block.block_number, block_name: block.block_name })
        .select('id')
        .single();
      if (blockErr) throw new Error(`blocks: ${blockErr.message}`);
      const blockId = blockRow.id;
      totalBlocks++;

      if (block.cards?.length) {
        const cardRows = block.cards.map(c => ({
          block_id: blockId,
          keyword: c.keyword,
          definition: c.definition,
          display_order: c.display_order,
        }));
        const { error } = await supabase.from('cards').insert(cardRows);
        if (error) throw new Error(`cards: ${error.message}`);
        totalCards += cardRows.length;
      }

      if (block.questions?.length) {
        const qRows = block.questions.map(q => {
          const isMatchUp = q.type === 'match_up';
          return {
            block_id: blockId,
            type: q.type,
            question: isMatchUp ? (q.instruction ?? '') : (q.question ?? ''),
            options: isMatchUp ? q.pairs : (q.options ?? null),
            correct_answer: isMatchUp ? null : (q.correct_answer ?? null),
            explanation: q.explanation ?? null,
            display_order: q.display_order,
          };
        });
        const { error } = await supabase.from('questions').insert(qRows);
        if (error) throw new Error(`questions: ${error.message}`);
        totalQuestions += qRows.length;
      }
    }
  }

  console.log(`  ✅ Done: ${topics.length} topics, ${totalBlocks} blocks, ${totalCards} cards, ${totalQuestions} questions`);
}

for (const filePath of files) {
  await seedSubject(filePath);
}
console.log('\n🎉 All subjects seeded.\n');
