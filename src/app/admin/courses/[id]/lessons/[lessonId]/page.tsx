import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LessonForm, QuizEditor, AssignmentForm } from '@/components/admin/lesson-editors';

export default async function LessonEditorPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id: courseId, lessonId } = await params;
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: { include: { course: { select: { id: true, title: true } } } },
      quizzes: { take: 1, include: { questions: { orderBy: { order: 'asc' } }, _count: { select: { attempts: true } } } },
      assignments: { take: 1, include: { _count: { select: { submissions: true } } } },
    },
  });
  if (!lesson || lesson.module.course.id !== courseId) notFound();

  const quiz = lesson.quizzes[0];
  const assignment = lesson.assignments[0];

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href={`/admin/courses/${courseId}`} className="text-sm text-muted-foreground hover:text-gray-900 flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" />{lesson.module.course.title}
      </Link>
      <div>
        <p className="text-sm text-muted-foreground">{lesson.module.title}</p>
        <h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Lesson</CardTitle></CardHeader>
        <CardContent><LessonForm lesson={lesson} /></CardContent>
      </Card>

      {lesson.type === 'QUIZ' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Quiz Questions</CardTitle>
            {quiz && <Badge variant="secondary">{quiz._count.attempts} attempts</Badge>}
          </CardHeader>
          <CardContent>
            <QuizEditor
              lessonId={lesson.id}
              quiz={quiz ? {
                title: quiz.title, timeLimit: quiz.timeLimit, passMark: quiz.passMark,
                questions: quiz.questions.map(q => ({
                  question: q.question,
                  // Always show at least 4 option slots in the editor.
                  options: [...q.options, ...Array(Math.max(0, 4 - q.options.length)).fill('')],
                  correctIndex: q.correctIndex,
                  explanation: q.explanation ?? '',
                })),
              } : { title: lesson.title, timeLimit: null, passMark: 50, questions: [] }}
            />
          </CardContent>
        </Card>
      )}

      {lesson.type === 'ASSIGNMENT' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Assignment</CardTitle>
            {assignment && (
              <Link href="/admin/content?tab=submissions" className="text-sm text-brand-600 hover:underline">
                {assignment._count.submissions} submissions →
              </Link>
            )}
          </CardHeader>
          <CardContent>
            <AssignmentForm
              lessonId={lesson.id}
              assignment={assignment ? {
                title: assignment.title, description: assignment.description,
                dueDate: assignment.dueDate?.toISOString() ?? null, maxMarks: assignment.maxMarks,
              } : { title: lesson.title, description: '', dueDate: null, maxMarks: 100 }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
