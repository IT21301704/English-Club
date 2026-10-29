import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin } from '@/lib/api';
import { sessionSchema } from '@/lib/validators';

export const POST = handler(async (req) => {
  await requireAdmin();
  const data = await parseBody(req, sessionSchema);
  const session = await db.session.create({ data });
  return NextResponse.json(session, { status: 201 });
});
