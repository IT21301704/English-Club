import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handler, parseBody, requireUser, ApiError } from '@/lib/api';
import { hasCourseAccess, syncEnrollmentCompletion } from '@/lib/enrollment';

const bodySchema = z.object({ lessonId: z.string().min(1), completed: z.boolean() });

/** Marks a lesson complete / incomplete for the current student. */
export const POST = handler(async (req) => {
  const user = await requireUser();
  const { lessonId, completed } = await parseBody(req, bodySchema);
  const lesson = await db.lesson.findUniqueOrThrow({ where: { id: lessonId }, include: { module: { select: { courseId: true } } } });
  const courseId = lesson.module.courseId;
  if (!(await hasCourseAccess(user.id, courseId))) throw new ApiError(403, 'You are not enrolled in this course');

  if (completed) {
    await db.progress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      update: {},
      create: { userId: user.id, lessonId },
    });
  } else {
    await db.progress.deleteMany({ where: { userId: user.id, lessonId } });
  }
  await syncEnrollmentCompletion(user.id, courseId);
  return NextResponse.json({ success: true });
});
