import { db } from '@/lib/db';

/**
 * Swaps an item with its neighbour and renumbers the list 1..n so `order`
 * values stay dense even after deletions.
 */
export async function moveOrdered<T extends { id: string }>(
  siblings: T[],
  id: string,
  direction: 'up' | 'down',
  setOrder: (id: string, order: number) => any,
) {
  const ids = siblings.map(s => s.id);
  const i = ids.indexOf(id);
  const j = direction === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await db.$transaction(ids.map((sid, idx) => setOrder(sid, idx + 1)));
}
