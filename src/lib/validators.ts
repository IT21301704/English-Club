import { z } from 'zod';

const optionalString = z.string().trim().optional().nullable().transform(v => v || null);
const optionalDate = z.union([z.string(), z.date()]).optional().nullable()
  .transform(v => (v ? new Date(v) : null))
  .refine(v => v === null || !isNaN(v.getTime()), 'Invalid date');

export const courseSchema = z.object({
  title: z.string().trim().min(3),
  slug: z.string().trim().optional(),
  description: z.string().trim().min(10),
  syllabus: optionalString,
  thumbnail: optionalString,
  category: z.string().trim().min(2),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  duration: optionalString,
  price: z.coerce.number().min(0),
  currency: z.string().trim().length(3).default('LKR'),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

export const moduleSchema = z.object({ title: z.string().trim().min(2) });

export const lessonSchema = z.object({
  title: z.string().trim().min(2),
  type: z.enum(['VIDEO', 'PDF', 'QUIZ', 'ASSIGNMENT']),
  contentUrl: optionalString,
  description: optionalString,
  duration: z.coerce.number().int().min(0).optional().nullable(),
  isPublished: z.boolean().default(true),
});

export const quizSchema = z.object({
  title: z.string().trim().min(2),
  timeLimit: z.coerce.number().int().min(1).optional().nullable(),
  passMark: z.coerce.number().int().min(0).max(100).default(50),
  questions: z.array(z.object({
    question: z.string().trim().min(1),
    options: z.array(z.string().trim().min(1)).min(2).max(6),
    correctIndex: z.number().int().min(0),
    explanation: optionalString,
  }).refine(q => q.correctIndex < q.options.length, 'Correct answer must be one of the options')).min(1),
});

export const assignmentSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().trim().min(5),
  dueDate: optionalDate,
  maxMarks: z.coerce.number().int().min(1).default(100),
});

export const gradeSchema = z.object({
  grade: z.coerce.number().int().min(0),
  feedback: optionalString,
  status: z.enum(['GRADED', 'RETURNED']).default('GRADED'),
});

export const studentCreateSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  phone: optionalString,
  password: z.string().min(8),
  courseIds: z.array(z.string()).default([]),
});

export const studentUpdateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  phone: optionalString,
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export const sessionSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().trim().min(2),
  description: optionalString,
  scheduledAt: z.coerce.date(),
  duration: z.coerce.number().int().min(5),
  meetLink: z.string().trim().url().optional().nullable().or(z.literal('').transform(() => null)),
  isCompleted: z.boolean().default(false),
});

export const invoiceSchema = z.object({
  userId: z.string().min(1),
  courseId: optionalString,
  amount: z.coerce.number().positive(),
  currency: z.string().trim().length(3).default('LKR'),
  description: z.string().trim().min(2),
  dueDate: optionalDate,
  markPaid: z.boolean().default(false),
  paymentRef: optionalString,
});

export const packageSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().min(2),
  features: z.array(z.string().trim().min(1)).min(1),
  price: z.coerce.number().min(0),
  currency: z.string().trim().length(3).default('LKR'),
  duration: z.string().trim().min(1),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2),
  phone: optionalString,
  bio: optionalString,
  avatar: optionalString,
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const testimonialSchema = z.object({
  content: z.string().trim().min(20).max(1000),
  rating: z.coerce.number().int().min(1).max(5),
  course: optionalString,
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10).max(5000),
});

/** Editable site settings — keys stored in the SiteSettings table. */
export const SETTING_KEYS = [
  'siteName', 'tagline', 'contactEmail', 'contactPhone', 'address', 'officeHours',
  'facebookUrl', 'youtubeUrl', 'linkedinUrl', 'whatsappNumber',
  'paymentInstructions',
] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];

export const settingsSchema = z.object(
  Object.fromEntries(SETTING_KEYS.map(k => [k, z.string().trim().max(2000).optional()])) as Record<SettingKey, z.ZodOptional<z.ZodString>>
);
