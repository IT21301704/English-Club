import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin } from '@/lib/api';
import { packageSchema } from '@/lib/validators';

export const POST = handler(async (req) => {
  await requireAdmin();
  const data = await parseBody(req, packageSchema);
  const pkg = await db.trainingPackage.create({ data });
  revalidatePath('/packages');
  return NextResponse.json(pkg, { status: 201 });
});
