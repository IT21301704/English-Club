import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Video, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';

export default async function SessionsAdminPage() {
  const sessions = await db.session.findMany({
    include: {
      course: { select: { title: true } },
      _count: { select: { attendances: true } },
    },
    orderBy: { scheduledAt: 'desc' },
  }).catch(() => []);

  const upcoming = sessions.filter(s => new Date(s.scheduledAt) >= new Date());
  // Upcoming soonest-first; past most-recent-first.
  upcoming.reverse();
  const past = sessions.filter(s => new Date(s.scheduledAt) < new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sessions</h2>
          <p className="text-muted-foreground">{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <Link href="/admin/sessions/new">
          <Button variant="brand" className="gap-2"><Plus className="h-4 w-4" />Schedule Session</Button>
        </Link>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Upcoming</h3>
        {upcoming.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No upcoming sessions</CardContent></Card>
        ) : (
          upcoming.map(s => (
            <Card key={s.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                    <Video className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.course.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDateTime(s.scheduledAt)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.duration} min</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/admin/sessions/${s.id}`}>
                    <Button size="sm" variant="outline">Manage</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {past.length > 0 && (
          <>
            <h3 className="font-semibold text-gray-700 mt-6">Past Sessions</h3>
            {past.slice(0, 20).map(s => (
              <Card key={s.id} className={s.isCompleted ? 'opacity-70' : ''}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.course.title} · {formatDateTime(s.scheduledAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.isCompleted
                      ? <Badge variant="secondary">Completed</Badge>
                      : <Badge variant="warning">Take attendance</Badge>}
                    <Link href={`/admin/sessions/${s.id}`}><Button size="sm" variant="outline">Manage</Button></Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
