import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarPlus, Clock, Video } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  // Only sessions for courses the student actually has access to.
  const myCourses = { enrollments: { some: { userId, status: { in: ['ACTIVE' as const, 'COMPLETED' as const] } } } };

  const sessions = await db.session.findMany({
    where: { scheduledAt: { gte: new Date() }, course: myCourses },
    include: { course: { select: { title: true } } },
    orderBy: { scheduledAt: 'asc' },
  }).catch(() => []);

  const pastSessions = await db.session.findMany({
    where: { scheduledAt: { lt: new Date() }, course: myCourses },
    include: { course: { select: { title: true } }, attendances: { where: { userId } } },
    orderBy: { scheduledAt: 'desc' },
    take: 10,
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Session Calendar</h2>
        <p className="text-muted-foreground">Upcoming and past live sessions</p>
      </div>

      {/* Upcoming */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4 text-brand-600" />Upcoming Sessions</CardTitle></CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming sessions scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-start justify-between p-4 rounded-xl border hover:border-brand-300 hover:bg-brand-50/50 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <Video className="h-6 w-6 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{s.title}</h3>
                      <p className="text-sm text-muted-foreground">{s.course.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDateTime(s.scheduledAt)}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.duration} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="brand">Upcoming</Badge>
                    <a href={`/api/sessions/${s.id}/ics`} className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                      <CalendarPlus className="h-3 w-3" />Add to calendar
                    </a>
                    {s.meetLink && (
                      <a href={s.meetLink} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="brand" className="text-xs gap-1"><Video className="h-3 w-3" />Join</Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past */}
      {pastSessions.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Past Sessions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pastSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border opacity-70">
                  <div>
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.course.title} · {formatDateTime(s.scheduledAt)}</p>
                  </div>
                  {s.attendances[0]?.attended
                    ? <Badge variant="success">Attended</Badge>
                    : s.attendances[0] ? <Badge variant="destructive">Missed</Badge> : <Badge variant="secondary">Past</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
