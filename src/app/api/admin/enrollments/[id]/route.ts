import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin, type RouteContext } from '@/lib/api';

type Ctx = RouteContext<{ id: string }>;

export const PATCH = handler<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const { status } = await parseBody(req, z.object({ status: z.enum(['PENDING', 'ACTIVE', 'COMPLETED', 'SUSPENDED']) }));
  const enrollment = await db.enrollment.update({
    where: { id },
    data: { status, completedAt: status === 'COMPLETED' ? new Date() : null },
  });
  return NextResponse.json(enrollment);
});

/** Unenroll. Progress, quiz attempts and submissions are kept in case the student re-enrolls. */
export const DELETE = handler<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  await db.enrollment.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
