import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handler, parseBody } from '@/lib/api';
import { contactSchema } from '@/lib/validators';

export const POST = handler(async (req) => {
  const data = await parseBody(req, contactSchema);
  await db.contactMessage.create({ data });
  return NextResponse.json({ success: true }, { status: 201 });
});
