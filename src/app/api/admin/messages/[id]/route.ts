import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin, type RouteContext } from '@/lib/api';

type Ctx = RouteContext<{ id: string }>;

export const PATCH = handler<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const { isRead } = await parseBody(req, z.object({ isRead: z.boolean() }));
  return NextResponse.json(await db.contactMessage.update({ where: { id }, data: { isRead } }));
});

export const DELETE = handler<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  await db.contactMessage.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
