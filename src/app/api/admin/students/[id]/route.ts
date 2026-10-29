import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin, type RouteContext } from '@/lib/api';
import { studentUpdateSchema } from '@/lib/validators';

type Ctx = RouteContext<{ id: string }>;

export const PATCH = handler<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const { password, ...data } = await parseBody(req, studentUpdateSchema);
  const user = await db.user.update({
    where: { id, role: 'STUDENT' },
    data: { ...data, ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}) },
    select: { id: true, name: true, email: true, isActive: true },
  });
  return NextResponse.json(user);
});

export const DELETE = handler<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  await db.user.delete({ where: { id, role: 'STUDENT' } });
  return NextResponse.json({ success: true });
});
