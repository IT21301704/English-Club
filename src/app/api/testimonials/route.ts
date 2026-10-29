import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handler, parseBody, requireUser } from '@/lib/api';
import { testimonialSchema } from '@/lib/validators';

/** Students submit a testimonial; it stays hidden until an admin approves it. */
export const POST = handler(async (req) => {
  const user = await requireUser();
  const data = await parseBody(req, testimonialSchema);
  const testimonial = await db.testimonial.create({ data: { ...data, userId: user.id, isApproved: false } });
  return NextResponse.json(testimonial, { status: 201 });
});
