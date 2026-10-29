import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin, type RouteContext } from '@/lib/api';
import { lessonSchema } from '@/lib/validators';
import { moveOrdered } from '@/lib/reorder';

type Ctx = RouteContext<{ id: string }>;

export const PATCH = handler<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const { move, ...data } = await parseBody(req, lessonSchema.partial().extend({ move: z.enum(['up', 'down']).optional() }));

  if (move) {
    const lesson = await db.lesson.findUniqueOrThrow({ where: { id } });
    const siblings = await db.lesson.findMany({ where: { moduleId: lesson.moduleId }, orderBy: { order: 'asc' } });
    await moveOrdered(siblings, id, move, (sid, order) => db.lesson.update({ where: { id: sid }, data: { order } }));
  }
  const lesson = Object.keys(data).length
    ? await db.lesson.update({ where: { id }, data })
    : await db.lesson.findUnique({ where: { id } });
  return NextResponse.json(lesson);
});

export const DELETE = handler<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  await db.lesson.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
