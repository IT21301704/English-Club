import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin, type RouteContext } from '@/lib/api';

export const PATCH = handler<RouteContext<{ id: string }>>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const { action } = await parseBody(req, z.object({ action: z.enum(['approve', 'reject', 'feature']) }));

  if (action === 'reject') {
    await db.testimonial.delete({ where: { id } });
    revalidatePath('/testimonials');
    return NextResponse.json({ success: true });
  }

  let data: { isApproved?: boolean; isFeatured?: boolean } = { isApproved: true };
  if (action === 'feature') {
    const current = await db.testimonial.findUniqueOrThrow({ where: { id }, select: { isFeatured: true } });
    data = { isFeatured: !current.isFeatured };
  }

  const updated = await db.testimonial.update({ where: { id }, data });
  revalidatePath('/testimonials');
  revalidatePath('/');
  return NextResponse.json(updated);
});
