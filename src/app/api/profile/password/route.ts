import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { handler, parseBody, requireUser, ApiError } from '@/lib/api';
import { passwordChangeSchema } from '@/lib/validators';

export const POST = handler(async (req) => {
  const user = await requireUser();
  const { currentPassword, newPassword } = await parseBody(req, passwordChangeSchema);
  const record = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!record.passwordHash || !(await bcrypt.compare(currentPassword, record.passwordHash))) {
    throw new ApiError(400, 'Current password is incorrect');
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } });
  return NextResponse.json({ success: true });
});
