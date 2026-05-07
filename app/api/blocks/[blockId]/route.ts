import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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

  if (!user) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'No session' },
      { status: 401 },
    );
  }

  // 2. Fetch block with topic → subject, cards, and questions in one round-trip
  const { data: block, error: blockError } = await supabase
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
    .single();

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

  // 3. Access gate — call the Postgres function
  const { data: canAccess, error: rpcError } = await supabase.rpc('can_access_topic', {
    user_id: user.id,
    topic_id: topic.id,
  });

  if (rpcError) {
    return NextResponse.json(
      { error: 'server_error', message: 'Access check failed' },
      { status: 500 },
    );
  }

  if (!canAccess) {
    return NextResponse.json(
      { error: 'locked', message: 'Upgrade to access this content' },
      { status: 403 },
    );
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
