import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { FREE_TOPIC_IDS } from '@/lib/free-topics';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> },
) {
  const { blockId } = await params;
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Fetch block and (if signed in) subscription status in parallel
  const [{ data: block, error: blockError }, { data: userData }] = await Promise.all([
    supabase
      .from('blocks')
      .select(`
        id,
        block_name,
        block_number,
        topics(
          id,
          name,
          subjects(id, name)
        ),
        cards(id, keyword, definition),
        questions(id, type, question, options, correct_answer, explanation, display_order)
      `)
      .eq('id', blockId)
      .single(),
    user
      ? supabase.from('users').select('subscription_status').eq('id', user.id).single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (blockError || !block) {
    return NextResponse.json(
      { error: 'not_found', message: 'Block not found' },
      { status: 404 },
    );
  }

  // PostgREST may return a single object or a one-element array for to-one joins
  const topic = Array.isArray(block.topics) ? block.topics[0] : block.topics;

  if (!topic) {
    return NextResponse.json(
      { error: 'not_found', message: 'Block not found' },
      { status: 404 },
    );
  }

  // 3. Gate: allow if the topic is in the free list OR the user has an active subscription
  const subscriptionActive = userData?.subscription_status === 'active';
  if (!FREE_TOPIC_IDS.has(topic.id) && !subscriptionActive) {
    return NextResponse.json({ error: 'locked' }, { status: 403 });
  }

  // 4. Shape the response
  const subject = Array.isArray(topic.subjects) ? topic.subjects[0] : topic.subjects;

  const questions = ((block.questions ?? []) as any[]).sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
  );

  return NextResponse.json({
    id: block.id,
    block_name: block.block_name,
    block_number: block.block_number,
    topic: {
      id: topic.id,
      name: topic.name,
    },
    subject: {
      id: subject?.id ?? null,
      name: subject?.name ?? null,
    },
    cards: block.cards ?? [],
    questions,
  });
}
