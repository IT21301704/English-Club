import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { calculateProgress } from '@/lib/utils';

export default async function PortalCoursesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const enrollments = await db.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          modules: { include: { lessons: { select: { id: true } } } },
        },
      },
    },
  }).catch(() => []);

  const completedLessons = await db.progress.findMany({ where: { userId }, select: { lessonId: true } }).catch(() => []);
  const completedIds = new Set(completedLessons.map(p => p.lessonId));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <p className="text-muted-foreground">{enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled</p>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No courses yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Browse our catalogue and enroll in your first course.</p>
            <Link href="/courses"><Button variant="brand">Browse Courses</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {enrollments.map((enrollment) => {
            const totalLessons = enrollment.course.modules.reduce((s, m) => s + m.lessons.length, 0);
            const completed = enrollment.course.modules.reduce((s, m) => s + m.lessons.filter(l => completedIds.has(l.id)).length, 0);
            const progress = calculateProgress(completed, totalLessons);

            return (
              <Card key={enrollment.id} className="card-hover overflow-hidden">
                <div className="h-28 bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-white/50" />
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="brand">{enrollment.course.category}</Badge>
                    <Badge variant={{ COMPLETED: 'success', ACTIVE: 'secondary', PENDING: 'warning', SUSPENDED: 'destructive' }[enrollment.status] as any}>
                      {{ COMPLETED: 'Completed', ACTIVE: 'Active', PENDING: 'Awaiting payment', SUSPENDED: 'Suspended' }[enrollment.status]}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">{enrollment.course.title}</h3>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{completed} / {totalLessons} lessons</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />{enrollment.course.duration}
                    </span>
                    <Link href={`/portal/courses/${enrollment.course.id}`}>
                      <Button size="sm" variant="brand" className="gap-1">
                        {enrollment.status === 'PENDING' ? 'Payment details' : 'Continue'} <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
