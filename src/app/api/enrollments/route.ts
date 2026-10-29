import { NextResponse } from 'next/server';
import { z } from 'zod';
import { handler, parseBody, requireUser, ApiError } from '@/lib/api';
import { requestEnrollment } from '@/lib/enrollment';

export const POST = handler(async (req) => {
  const user = await requireUser();
  const { courseId } = await parseBody(req, z.object({ courseId: z.string().min(1) }));
  const result = await requestEnrollment(user.id, courseId);
  if ('error' in result) throw new ApiError(result.error === 'Course not found' ? 404 : 403, result.error!);
  return NextResponse.json(result, { status: 201 });
});
