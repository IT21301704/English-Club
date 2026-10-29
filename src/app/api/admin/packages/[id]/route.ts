import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin, type RouteContext } from '@/lib/api';
import { packageSchema } from '@/lib/validators';

type Ctx = RouteContext<{ id: string }>;

export const PATCH = handler<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const data = await parseBody(req, packageSchema.partial());
  const pkg = await db.trainingPackage.update({ where: { id }, data });
  revalidatePath('/packages');
  return NextResponse.json(pkg);
});

export const DELETE = handler<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  await db.trainingPackage.delete({ where: { id } });
  revalidatePath('/packages');
  return NextResponse.json({ success: true });
});
