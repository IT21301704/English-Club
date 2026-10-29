import { db } from '@/lib/db';

/**
 * Student-initiated enrollment. Free courses activate immediately; paid courses
 * create a PENDING enrollment plus a PENDING invoice. Whatever marks that invoice
 * PAID (admin today, a payment-gateway webhook in Phase 5) calls markInvoicePaid().
 */
export async function requestEnrollment(userId: string, courseId: string) {
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course || !course.isPublished) return { error: 'Course not found' as const };

  const existing = await db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
  // Only an admin can lift a suspension.
  if (existing?.status === 'SUSPENDED') return { error: 'Your enrollment in this course is suspended. Please contact your trainer.' as const };
  if (existing) return { enrollment: existing, invoice: null };

  if (course.price <= 0) {
    const enrollment = await db.enrollment.create({ data: { userId, courseId, status: 'ACTIVE' } });
    return { enrollment, invoice: null };
  }

  return db.$transaction(async tx => {
    const enrollment = await tx.enrollment.create({ data: { userId, courseId, status: 'PENDING' } });
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const invoice = await tx.invoice.create({
      data: {
        userId, courseId, amount: course.price, currency: course.currency,
        description: `Course fee — ${course.title}`, dueDate,
      },
    });
    return { enrollment, invoice };
  });
}

/** Marks an invoice paid and activates the linked course enrollment, if any. */
export async function markInvoicePaid(invoiceId: string, paymentRef?: string) {
  return db.$transaction(async tx => {
    const invoice = await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: 'PAID', paidAt: new Date(), paymentRef },
    });
    if (invoice.courseId) {
      await tx.enrollment.upsert({
        where: { userId_courseId: { userId: invoice.userId, courseId: invoice.courseId } },
        update: { status: 'ACTIVE' },
        create: { userId: invoice.userId, courseId: invoice.courseId, status: 'ACTIVE' },
      });
    }
    return invoice;
  });
}

/** Statuses that grant access to course content. */
export const ACCESS_STATUSES = ['ACTIVE', 'COMPLETED'] as const;

export async function hasCourseAccess(userId: string, courseId: string) {
  const enrollment = await db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
  return !!enrollment && (ACCESS_STATUSES as readonly string[]).includes(enrollment.status);
}

/** Recomputes completion and flips the enrollment to COMPLETED / back to ACTIVE. */
export async function syncEnrollmentCompletion(userId: string, courseId: string) {
  const lessons = await db.lesson.findMany({ where: { module: { courseId }, isPublished: true }, select: { id: true } });
  if (lessons.length === 0) return;
  const done = await db.progress.count({ where: { userId, lessonId: { in: lessons.map(l => l.id) } } });
  const complete = done >= lessons.length;
  await db.enrollment.updateMany({
    where: { userId, courseId, status: complete ? 'ACTIVE' : 'COMPLETED' },
    data: complete ? { status: 'COMPLETED', completedAt: new Date() } : { status: 'ACTIVE', completedAt: null },
  });
}
