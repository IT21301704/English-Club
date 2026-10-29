import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin, type RouteContext } from '@/lib/api';
import { courseSchema } from '@/lib/validators';
import { slugify } from '@/lib/utils';

type Ctx = RouteContext<{ id: string }>;

export const PATCH = handler<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const { slug, ...data } = await parseBody(req, courseSchema.partial());
  const course = await db.course.update({
    where: { id },
    // Only an explicit slug changes the URL — renaming a course must not break links.
    data: { ...data, ...(slug ? { slug: slugify(slug) } : {}) },
  });
  revalidatePath('/courses');
  revalidatePath(`/courses/${course.slug}`);
  return NextResponse.json(course);
});

export const DELETE = handler<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  await db.course.delete({ where: { id } });
  revalidatePath('/courses');
  return NextResponse.json({ success: true });
});
