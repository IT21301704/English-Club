import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDate, formatDateTime, calculateProgress } from '@/lib/utils';
import { Stagger, StaggerItem, HoverLift, CountUp } from '@/components/motion';

export default async function PortalDashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const [enrollments, upcomingSessions, completedLessons] = await Promise.all([
    db.enrollment.findMany({
      where: { userId, status: { in: ['ACTIVE', 'COMPLETED'] } },
      include: {
        course: {
          include: { modules: { include: { lessons: { where: { isPublished: true }, select: { id: true } } } } },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    }).catch(() => []),
    db.session.findMany({
      where: {
        scheduledAt: { gte: new Date() },
        course: { enrollments: { some: { userId, status: { in: ['ACTIVE', 'COMPLETED'] } } } },
      },
      include: { course: { select: { title: true } } },
      orderBy: { scheduledAt: 'asc' },
      take: 3,
    }).catch(() => []),
    db.progress.findMany({ where: { userId }, select: { lessonId: true } }).catch(() => []),
  ]);

  const completedIds = new Set(completedLessons.map(p => p.lessonId));
  const courseStats = enrollments.map(e => {
    const ids = e.course.modules.flatMap(m => m.lessons.map(l => l.id));
    const done = ids.filter(id => completedIds.has(id)).length;
    return { enrollment: e, total: ids.length, done };
  });
  const totalLessons = courseStats.reduce((s, c) => s + c.total, 0);
  const totalDone = courseStats.reduce((s, c) => s + c.done, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-muted-foreground">Track your learning progress</p>
      </div>

      {/* Stats Cards */}
      <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Enrolled Courses', value: enrollments.length, icon: BookOpen, color: 'text-brand-600', bg: 'bg-brand-100' },
          { label: 'Lessons Completed', value: totalDone, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Total Lessons', value: totalLessons, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Upcoming Sessions', value: upcomingSessions.length, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-100' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <StaggerItem key={label}>
            <HoverLift>
              <Card className="group h-full transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900"><CountUp value={value} /></div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                </CardContent>
              </Card>
            </HoverLift>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Enrolled Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">My Courses</CardTitle>
            <Link href="/portal/courses"><Button variant="ghost" size="sm" className="text-xs">View All</Button></Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No courses enrolled yet</p>
                <Link href="/courses"><Button size="sm" variant="brand" className="mt-3">Browse Courses</Button></Link>
              </div>
            ) : (
              courseStats.slice(0, 4).map(({ enrollment, total, done }) => {
                const prog = calculateProgress(done, total);
                return (
                  <div key={enrollment.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Link href={`/portal/courses/${enrollment.courseId}`} className="text-sm font-medium text-gray-900 hover:text-brand-700">{enrollment.course.title}</Link>
                      <span className="text-xs text-muted-foreground">{prog}%</span>
                    </div>
                    <Progress value={prog} className="h-2" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Upcoming Sessions</CardTitle>
            <Link href="/portal/calendar"><Button variant="ghost" size="sm" className="text-xs">Calendar</Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming sessions scheduled</p>
              </div>
            ) : (
              upcomingSessions.map((s) => (
                <div key={s.id} className="flex items-start gap-3 p-3 rounded-lg border transition-all hover:bg-brand-50/50 hover:border-brand-200 hover:translate-x-1">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.course.title}</p>
                    <p className="text-xs text-brand-600 mt-1">{formatDateTime(s.scheduledAt)}</p>
                  </div>
                  {s.meetLink && (
                    <a href={s.meetLink} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="brand" className="text-xs">Join</Button>
                    </a>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
