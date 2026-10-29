import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handler, parseBody, requireUser, ApiError, type RouteContext } from '@/lib/api';
import { hasCourseAccess } from '@/lib/enrollment';

const bodySchema = z.object({
  fileUrl: z.string().url().optional().nullable(),
  textContent: z.string().trim().max(20000).optional().nullable(),
}).refine(b => b.fileUrl || b.textContent, 'Attach a file or write an answer');

/** Submit or resubmit. Resubmitting is blocked once the work has been graded. */
export const POST = handler<RouteContext<{ id: string }>>(async (req, { params }) => {
  const user = await requireUser();
  const { id: assignmentId } = await params;
  const data = await parseBody(req, bodySchema);

  const assignment = await db.assignment.findUniqueOrThrow({
    where: { id: assignmentId },
    include: { lesson: { include: { module: { select: { courseId: true } } } } },
  });
  if (!(await hasCourseAccess(user.id, assignment.lesson.module.courseId))) throw new ApiError(403, 'You are not enrolled in this course');

  const existing = await db.submission.findUnique({ where: { assignmentId_userId: { assignmentId, userId: user.id } } });
  if (existing?.status === 'GRADED') throw new ApiError(409, 'This assignment has already been graded');

  const submission = await db.submission.upsert({
    where: { assignmentId_userId: { assignmentId, userId: user.id } },
    update: { ...data, status: 'SUBMITTED', submittedAt: new Date(), grade: null, gradedAt: null },
    create: { ...data, assignmentId, userId: user.id },
  });
  return NextResponse.json(submission, { status: 201 });
});
