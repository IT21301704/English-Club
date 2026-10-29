import type { User, Course, Enrollment, Module, Lesson, Session, Invoice, Testimonial } from '@prisma/client';

export type { User, Course, Enrollment, Module, Lesson, Session, Invoice, Testimonial };

export type UserRole = 'ADMIN' | 'STUDENT';

export type CourseWithModules = Course & {
  modules: (Module & { lessons: Lesson[] })[];
  _count: { enrollments: number };
};

export type EnrollmentWithCourse = Enrollment & {
  course: Course;
};

export type SessionWithCourse = Session & {
  course: { title: string; id: string };
};

export type StudentWithStats = User & {
  _count: { enrollments: number };
  enrollments: EnrollmentWithCourse[];
};

export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  totalSessions: number;
  recentEnrollments: number;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}
