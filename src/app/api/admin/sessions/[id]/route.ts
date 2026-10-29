import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin, type RouteContext } from '@/lib/api';
import { sessionSchema } from '@/lib/validators';

type Ctx = RouteContext<{ id: string }>;

export const PATCH = handler<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const data = await parseBody(req, sessionSchema.partial());
  const session = await db.session.update({ where: { id }, data });
  return NextResponse.json(session);
});

export const DELETE = handler<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  await db.session.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
