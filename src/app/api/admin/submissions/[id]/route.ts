import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin, ApiError, type RouteContext } from '@/lib/api';
import { gradeSchema } from '@/lib/validators';

export const PATCH = handler<RouteContext<{ id: string }>>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const data = await parseBody(req, gradeSchema);
  const submission = await db.submission.findUniqueOrThrow({ where: { id }, include: { assignment: true } });
  if (data.grade > submission.assignment.maxMarks) throw new ApiError(422, `Grade cannot exceed ${submission.assignment.maxMarks}`);
  const updated = await db.submission.update({ where: { id }, data: { ...data, gradedAt: new Date() } });
  return NextResponse.json(updated);
});
