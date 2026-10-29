import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarPlus, Trash2, Video } from 'lucide-react';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/components/admin/action-button';
import { SessionForm, AttendanceForm } from '@/components/admin/session-forms';
import { formatDateTime } from '@/lib/utils';

export default async function ManageSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await db.session.findUnique({
    where: { id },
    include: { course: { select: { id: true, title: true } }, attendances: true },
  });
  if (!session) notFound();

  const [courses, enrollments] = await Promise.all([
    db.course.findMany({ select: { id: true, title: true }, orderBy: { title: 'asc' } }),
    db.enrollment.findMany({
      where: { courseId: session.courseId, status: { in: ['ACTIVE', 'COMPLETED'] } },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { user: { name: 'asc' } },
    }),
  ]);
  const attended = new Set(session.attendances.filter(a => a.attended).map(a => a.userId));
  const isPast = session.scheduledAt < new Date();

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/admin/sessions" className="text-sm text-muted-foreground hover:text-gray-900 flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" />Back to sessions
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">{session.title}</h2>
            <Badge variant={session.isCompleted ? 'secondary' : isPast ? 'warning' : 'brand'}>
              {session.isCompleted ? 'Completed' : isPast ? 'Attendance not taken' : 'Upcoming'}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{session.course.title} · {formatDateTime(session.scheduledAt)} · {session.duration} min</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {session.meetLink && (
            <a href={session.meetLink} target="_blank" rel="noreferrer"><Button variant="brand" className="gap-2"><Video className="h-4 w-4" />Start</Button></a>
          )}
          <a href={`/api/sessions/${session.id}/ics`}><Button variant="outline" className="gap-2"><CalendarPlus className="h-4 w-4" />Calendar invite (.ics)</Button></a>
          <ActionButton url={`/api/admin/sessions/${session.id}`} method="DELETE" redirectTo="/admin/sessions"
            confirmText={`Delete session "${session.title}"?`} variant="outline" className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700">
            <Trash2 className="h-4 w-4" />Delete
          </ActionButton>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Session Details</CardTitle></CardHeader>
          <CardContent>
            <SessionForm courses={courses} session={{
              id: session.id, courseId: session.courseId, title: session.title, description: session.description,
              scheduledAt: session.scheduledAt.toISOString(), duration: session.duration, meetLink: session.meetLink,
            }} />
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Attendance</CardTitle>
            <p className="text-xs text-muted-foreground">Enrolled students can download the invite from their portal calendar.</p>
          </CardHeader>
          <CardContent>
            <AttendanceForm sessionId={session.id} students={enrollments.map(e => ({
              userId: e.user.id, name: e.user.name, email: e.user.email, attended: attended.has(e.user.id),
            }))} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
