import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin } from '@/lib/api';
import { courseSchema } from '@/lib/validators';
import { slugify } from '@/lib/utils';

export const POST = handler(async (req) => {
  await requireAdmin();
  const { slug, ...data } = await parseBody(req, courseSchema);
  const course = await db.course.create({ data: { ...data, slug: slugify(slug || data.title) } });
  revalidatePath('/courses');
  return NextResponse.json(course, { status: 201 });
});
