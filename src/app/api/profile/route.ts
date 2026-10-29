import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handler, parseBody, requireUser } from '@/lib/api';
import { profileSchema } from '@/lib/validators';

export const PATCH = handler(async (req) => {
  const user = await requireUser();
  const data = await parseBody(req, profileSchema);
  const updated = await db.user.update({
    where: { id: user.id },
    data,
    select: { id: true, name: true, phone: true, bio: true, avatar: true },
  });
  return NextResponse.json(updated);
});
