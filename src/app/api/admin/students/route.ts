import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin } from '@/lib/api';
import { studentCreateSchema } from '@/lib/validators';

export const POST = handler(async (req) => {
  await requireAdmin();
  const { password, courseIds, ...data } = await parseBody(req, studentCreateSchema);
  const user = await db.user.create({
    data: {
      ...data,
      role: 'STUDENT',
      passwordHash: await bcrypt.hash(password, 12),
      enrollments: { create: courseIds.map(courseId => ({ courseId, status: 'ACTIVE' as const })) },
    },
    select: { id: true, name: true, email: true },
  });
  return NextResponse.json(user, { status: 201 });
});
