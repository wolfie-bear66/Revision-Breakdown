import pg from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.ejvivqhtrnwfijtbarxq',
  password: 'FNsTNB3brmen49tZ',
  ssl: { rejectUnauthorized: false },
});

// Pass a filename as argument, or seed all JSON files in the same directory
const args = process.argv.slice(2);
const contentDir = args[0] ? dirname(args[0]) : join(__dirname, '../content');
const files = args[0]
  ? [args[0]]
  : readdirSync(contentDir).filter(f => f.endsWith('.json')).map(f => join(contentDir, f));

async function seedSubject(client, filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  const { subject, topics } = data;

  console.log(`\n📘 Seeding: ${subject.name} (${subject.exam_board})`);

  // Check if subject already exists
  const existing = await client.query(
    'SELECT id FROM subjects WHERE slug = $1',
    [subject.slug]
  );
  if (existing.rows.length > 0) {
    console.log(`  ⚠️  Subject "${subject.slug}" already exists — skipping.`);
    return;
  }

  // Insert subject
  const subRes = await client.query(
    `INSERT INTO subjects (name, slug, colour, exam_board, emoji)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [subject.name, subject.slug, subject.colour, subject.exam_board, subject.emoji]
  );
  const subjectId = subRes.rows[0].id;

  let totalBlocks = 0, totalCards = 0, totalQuestions = 0;

  for (const topic of topics) {
    const topRes = await client.query(
      `INSERT INTO topics (subject_id, name, paper, display_order)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [subjectId, topic.name, topic.paper, topic.display_order]
    );
    const topicId = topRes.rows[0].id;

    for (const block of topic.blocks) {
      const blkRes = await client.query(
        `INSERT INTO blocks (topic_id, block_number, block_name)
         VALUES ($1, $2, $3) RETURNING id`,
        [topicId, block.block_number, block.block_name]
      );
      const blockId = blkRes.rows[0].id;
      totalBlocks++;

      // Cards
      if (block.cards?.length) {
        const cardValues = block.cards.map((c, i) => `($1, $${i * 3 + 2}, $${i * 3 + 3}, $${i * 3 + 4})`).join(', ');
        const cardParams = [blockId, ...block.cards.flatMap(c => [c.keyword, c.definition, c.display_order])];
        // Use individual inserts to keep params simple
        for (const c of block.cards) {
          await client.query(
            `INSERT INTO cards (block_id, keyword, definition, display_order)
             VALUES ($1, $2, $3, $4)`,
            [blockId, c.keyword, c.definition, c.display_order]
          );
          totalCards++;
        }
      }

      // Questions
      if (block.questions?.length) {
        for (const q of block.questions) {
          const isMatchUp = q.type === 'match_up';
          const questionText = isMatchUp ? (q.instruction ?? '') : (q.question ?? '');
          const options = isMatchUp ? q.pairs : (q.options ?? null);
          const correctAnswer = isMatchUp ? null : (q.correct_answer ?? null);
          const explanation = q.explanation ?? null;

          await client.query(
            `INSERT INTO questions (block_id, type, question, options, correct_answer, explanation, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [blockId, q.type, questionText, options ? JSON.stringify(options) : null, correctAnswer, explanation, q.display_order]
          );
          totalQuestions++;
        }
      }
    }
  }

  console.log(`  ✅ Done: ${topics.length} topics, ${totalBlocks} blocks, ${totalCards} cards, ${totalQuestions} questions`);
}

async function main() {
  const client = await pool.connect();
  try {
    for (const filePath of files) {
      await seedSubject(client, filePath);
    }
    console.log('\n🎉 All subjects seeded.\n');
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
