import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Eye, Trash2, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CourseForm } from '@/components/admin/course-form';
import { CurriculumEditor } from '@/components/admin/curriculum-editor';
import { ActionButton } from '@/components/admin/action-button';

export default async function ManageCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await db.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: { _count: { select: { quizzes: true, assignments: true } } },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) notFound();

  const modules = course.modules.map(m => ({
    id: m.id,
    title: m.title,
    lessons: m.lessons.map(l => ({
      id: l.id, title: l.title, type: l.type, isPublished: l.isPublished, contentUrl: l.contentUrl,
      hasQuiz: l._count.quizzes > 0, hasAssignment: l._count.assignments > 0,
    })),
  }));
  const lessonCount = modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/admin/courses" className="text-sm text-muted-foreground hover:text-gray-900 flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" />Back to courses
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
            <Badge variant={course.isPublished ? 'success' : 'secondary'}>{course.isPublished ? 'Live' : 'Draft'}</Badge>
          </div>
          <p className="text-muted-foreground text-sm flex items-center gap-3">
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course._count.enrollments} enrolled</span>
            <span>{modules.length} modules · {lessonCount} lessons</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/courses/${course.slug}`} target="_blank">
            <Button variant="outline" className="gap-2"><Eye className="h-4 w-4" />View public page</Button>
          </Link>
          <ActionButton
            url={`/api/admin/courses/${course.id}`} method="DELETE" redirectTo="/admin/courses"
            confirmText={`Permanently delete "${course.title}"? This removes all modules, lessons, enrollments, progress and sessions for it.`}
            variant="outline" className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />Delete
          </ActionButton>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Curriculum</CardTitle></CardHeader>
        <CardContent><CurriculumEditor courseId={course.id} modules={modules} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Course Details</CardTitle></CardHeader>
        <CardContent><CourseForm course={course} /></CardContent>
      </Card>
    </div>
  );
}
