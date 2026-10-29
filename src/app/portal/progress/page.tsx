import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, CheckCircle, BookOpen, Award } from 'lucide-react';
import { calculateProgress } from '@/lib/utils';

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const [enrollments, completedLessons, quizAttempts] = await Promise.all([
    db.enrollment.findMany({
      where: { userId },
      include: { course: { include: { modules: { include: { lessons: { select: { id: true } } } } } } },
    }).catch(() => []),
    db.progress.findMany({ where: { userId } }).catch(() => []),
    db.quizAttempt.findMany({
      where: { userId },
      include: { quiz: { select: { title: true } } },
      orderBy: { completedAt: 'desc' },
      take: 5,
    }).catch(() => []),
  ]);

  const completedIds = new Set(completedLessons.map(p => p.lessonId));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Progress</h2>
        <p className="text-muted-foreground">Track your learning journey</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Courses Enrolled', value: enrollments.length, icon: BookOpen, color: 'text-brand-600', bg: 'bg-brand-100' },
          { label: 'Lessons Completed', value: completedLessons.length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Quizzes Taken', value: quizAttempts.length, icon: Award, color: 'text-purple-600', bg: 'bg-purple-100' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Course Progress */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" />Course Progress</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No courses enrolled yet.</p>
          ) : (
            enrollments.map((e) => {
              const total = e.course.modules.reduce((s, m) => s + m.lessons.length, 0);
              const done = e.course.modules.reduce((s, m) => s + m.lessons.filter(l => completedIds.has(l.id)).length, 0);
              const prog = calculateProgress(done, total);
              return (
                <div key={e.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-900">{e.course.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{done}/{total} lessons</span>
                      <Badge variant={prog === 100 ? 'success' : 'secondary'}>{prog}%</Badge>
                    </div>
                  </div>
                  <Progress value={prog} className="h-3" />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Quiz Results */}
      {quizAttempts.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Quiz Results</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quizAttempts.map((attempt) => {
                const pct = Math.round((attempt.score / attempt.maxScore) * 100);
                return (
                  <div key={attempt.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{attempt.quiz.title}</p>
                      <p className="text-xs text-muted-foreground">{attempt.score} / {attempt.maxScore} marks</p>
                    </div>
                    <Badge variant={pct >= 75 ? 'success' : pct >= 50 ? 'warning' : 'destructive'}>
                      {pct}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
