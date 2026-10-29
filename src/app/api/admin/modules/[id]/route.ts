import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin, type RouteContext } from '@/lib/api';
import { moveOrdered } from '@/lib/reorder';

type Ctx = RouteContext<{ id: string }>;

export const PATCH = handler<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const body = await parseBody(req, z.object({ title: z.string().trim().min(2).optional(), move: z.enum(['up', 'down']).optional() }));

  if (body.move) {
    const mod = await db.module.findUniqueOrThrow({ where: { id } });
    const siblings = await db.module.findMany({ where: { courseId: mod.courseId }, orderBy: { order: 'asc' } });
    await moveOrdered(siblings, id, body.move, (sid, order) => db.module.update({ where: { id: sid }, data: { order } }));
  }
  const mod = body.title ? await db.module.update({ where: { id }, data: { title: body.title } }) : await db.module.findUnique({ where: { id } });
  return NextResponse.json(mod);
});

export const DELETE = handler<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  await db.module.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
