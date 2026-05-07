import { cookies, headers } from 'next/headers';

export interface BlockData {
  id: string;
  block_name: string;
  block_number: number;
  topic: { id: string; name: string };
  subject: { id: string | null; name: string | null };
  cards: Array<{ id: string; keyword: string; definition: string }>;
  questions: Array<{
    id: string;
    type: string;
    question: string;
    options: unknown;
    correct_answer: string;
    explanation: string | null;
    display_order: number | null;
  }>;
}

type FetchBlockResult =
  | { ok: true; data: BlockData }
  | { ok: false; status: 401 | 403 | 404 | 500; locked: boolean };

export async function fetchBlockData(blockId: string): Promise<FetchBlockResult> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');

  const hdrs = await headers();
  const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host') ?? 'localhost:3000';
  const proto = process.env.NODE_ENV === 'production' ? 'https' : 'http';

  let res: Response;
  try {
    res = await fetch(`${proto}://${host}/api/blocks/${blockId}`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });
  } catch {
    return { ok: false, status: 500, locked: false };
  }

  if (res.status === 401) return { ok: false, status: 401, locked: false };
  if (res.status === 404) return { ok: false, status: 404, locked: false };
  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    return { ok: false, status: 403, locked: body.error === 'locked' };
  }
  if (!res.ok) return { ok: false, status: 500, locked: false };

  const data: BlockData = await res.json();
  return { ok: true, data };
}
