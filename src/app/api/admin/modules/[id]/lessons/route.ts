import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin, type RouteContext } from '@/lib/api';
import { lessonSchema } from '@/lib/validators';

export const POST = handler<RouteContext<{ id: string }>>(async (req, { params }) => {
  await requireAdmin();
  const { id: moduleId } = await params;
  const data = await parseBody(req, lessonSchema);
  const last = await db.lesson.findFirst({ where: { moduleId }, orderBy: { order: 'desc' }, select: { order: true } });
  const lesson = await db.lesson.create({ data: { ...data, moduleId, order: (last?.order ?? 0) + 1 } });
  return NextResponse.json(lesson, { status: 201 });
});
