import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin, type RouteContext } from '@/lib/api';
import { assignmentSchema } from '@/lib/validators';

export const PUT = handler<RouteContext<{ id: string }>>(async (req, { params }) => {
  await requireAdmin();
  const { id: lessonId } = await params;
  const data = await parseBody(req, assignmentSchema);
  const existing = await db.assignment.findFirst({ where: { lessonId } });
  const assignment = existing
    ? await db.assignment.update({ where: { id: existing.id }, data })
    : await db.assignment.create({ data: { ...data, lessonId } });
  return NextResponse.json(assignment);
});
