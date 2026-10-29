import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin, type RouteContext } from '@/lib/api';

/** Replaces the attendance register: `attendedUserIds` attended, every other enrolled student did not. */
export const PUT = handler<RouteContext<{ id: string }>>(async (req, { params }) => {
  await requireAdmin();
  const { id: sessionId } = await params;
  const { attendedUserIds } = await parseBody(req, z.object({ attendedUserIds: z.array(z.string()) }));
  const session = await db.session.findUniqueOrThrow({ where: { id: sessionId } });
  const enrolled = await db.enrollment.findMany({ where: { courseId: session.courseId }, select: { userId: true } });
  const attended = new Set(attendedUserIds);

  await db.$transaction(enrolled.map(({ userId }) => db.sessionAttendance.upsert({
    where: { sessionId_userId: { sessionId, userId } },
    update: { attended: attended.has(userId) },
    create: { sessionId, userId, attended: attended.has(userId) },
  })));
  await db.session.update({ where: { id: sessionId }, data: { isCompleted: true } });
  return NextResponse.json({ success: true, attended: attended.size });
});
