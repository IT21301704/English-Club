import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin } from '@/lib/api';

/** Admin enrolls a student directly (no invoice — use Payments to bill separately). */
export const POST = handler(async (req) => {
  await requireAdmin();
  const { userId, courseId } = await parseBody(req, z.object({ userId: z.string().min(1), courseId: z.string().min(1) }));
  const enrollment = await db.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { status: 'ACTIVE' },
    create: { userId, courseId, status: 'ACTIVE' },
  });
  return NextResponse.json(enrollment, { status: 201 });
});
