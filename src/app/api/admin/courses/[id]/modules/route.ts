import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin, type RouteContext } from '@/lib/api';
import { moduleSchema } from '@/lib/validators';

export const POST = handler<RouteContext<{ id: string }>>(async (req, { params }) => {
  await requireAdmin();
  const { id: courseId } = await params;
  const { title } = await parseBody(req, moduleSchema);
  const last = await db.module.findFirst({ where: { courseId }, orderBy: { order: 'desc' }, select: { order: true } });
  const mod = await db.module.create({ data: { courseId, title, order: (last?.order ?? 0) + 1 } });
  return NextResponse.json(mod, { status: 201 });
});
