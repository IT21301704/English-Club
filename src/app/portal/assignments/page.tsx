import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';

export default async function AssignmentsPage() {
  const user = await getSessionUser();
  const userId = user?.id;

  const assignments = await db.assignment.findMany({
    where: {
      lesson: {
        isPublished: true,
        module: { course: { enrollments: { some: { userId, status: { in: ['ACTIVE', 'COMPLETED'] } } } } },
      },
    },
    include: {
      lesson: { include: { module: { include: { course: { select: { id: true, title: true } } } } } },
      submissions: { where: { userId } },
    },
    orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
  }).catch(() => []);

  const now = new Date();
  const rows = assignments.map(a => {
    const sub = a.submissions[0];
    const state =
      sub?.status === 'GRADED' ? 'graded' :
      sub ? 'submitted' :
      a.dueDate && a.dueDate < now ? 'overdue' : 'todo';
    return { a, sub, state };
  });
  const todo = rows.filter(r => r.state === 'todo' || r.state === 'overdue');
  const rest = rows.filter(r => r.state === 'submitted' || r.state === 'graded');

  const badge = {
    todo: <Badge variant="warning">To do</Badge>,
    overdue: <Badge variant="destructive">Overdue</Badge>,
    submitted: <Badge variant="info">Submitted</Badge>,
    graded: <Badge variant="success">Graded</Badge>,
  };

  const renderRow = ({ a, sub, state }: (typeof rows)[number]) => (
    <Card key={a.id}>
      <CardContent className="p-5 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{a.title}</h3>
            {badge[state as keyof typeof badge]}
          </div>
          <p className="text-xs text-muted-foreground">
            {a.lesson.module.course.title}{a.dueDate && ` · due ${formatDateTime(a.dueDate)}`} · {a.maxMarks} marks
          </p>
          {sub?.status === 'GRADED' && (
            <div className="pt-2 text-sm">
              <p className="font-semibold">Grade: {sub.grade} / {a.maxMarks}</p>
              {sub.feedback && <p className="text-gray-600 whitespace-pre-wrap">{sub.feedback}</p>}
            </div>
          )}
        </div>
        <Link href={`/portal/courses/${a.lesson.module.course.id}?lesson=${a.lessonId}`}>
          <Button size="sm" variant={state === 'todo' || state === 'overdue' ? 'brand' : 'outline'}>
            {state === 'todo' || state === 'overdue' ? 'Start' : 'View'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
        <p className="text-muted-foreground">{todo.length} to do · {rest.length} submitted</p>
      </div>

      {rows.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No assignments yet.</p>
        </CardContent></Card>
      ) : (
        <>
          {todo.length > 0 && <div className="space-y-3"><h3 className="font-semibold text-gray-700">To do</h3>{todo.map(renderRow)}</div>}
          {rest.length > 0 && <div className="space-y-3"><h3 className="font-semibold text-gray-700">Submitted</h3>{rest.map(renderRow)}</div>}
        </>
      )}
    </div>
  );
}
