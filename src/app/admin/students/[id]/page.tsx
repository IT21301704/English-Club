import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Ban, CheckCircle, Trash2, Mail, Phone } from 'lucide-react';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ActionButton } from '@/components/admin/action-button';
import { EditStudentForm, EnrollForm, EnrollmentStatusSelect } from '@/components/admin/student-forms';
import { calculateProgress, formatCurrency, formatDate, getInitials } from '@/lib/utils';

const invoiceVariant: Record<string, any> = { PAID: 'success', PENDING: 'warning', OVERDUE: 'destructive', CANCELLED: 'secondary' };

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await db.user.findUnique({
    where: { id, role: 'STUDENT' },
    include: {
      enrollments: {
        include: { course: { include: { modules: { include: { lessons: { select: { id: true } } } } } } },
        orderBy: { enrolledAt: 'desc' },
      },
      progress: { select: { lessonId: true } },
      quizAttempts: { include: { quiz: { select: { title: true } } }, orderBy: { completedAt: 'desc' }, take: 10 },
      submissions: { include: { assignment: { select: { title: true, maxMarks: true } } }, orderBy: { submittedAt: 'desc' }, take: 10 },
      invoices: { orderBy: { issuedAt: 'desc' } },
      _count: { select: { sessionAttendances: { where: { attended: true } } } },
    },
  });
  if (!student) notFound();

  const allCourses = await db.course.findMany({ select: { id: true, title: true }, orderBy: { title: 'asc' } });
  const enrolledIds = new Set(student.enrollments.map(e => e.courseId));
  const completed = new Set(student.progress.map(p => p.lessonId));

  return (
    <div className="space-y-6 max-w-6xl">
      <Link href="/admin/students" className="text-sm text-muted-foreground hover:text-gray-900 flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" />Back to students
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-brand-100 text-brand-700 text-lg">{getInitials(student.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
              <Badge variant={student.isActive ? 'success' : 'destructive'}>{student.isActive ? 'Active' : 'Suspended'}</Badge>
            </div>
            <p className="text-sm text-muted-foreground flex flex-wrap gap-3">
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{student.email}</span>
              {student.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{student.phone}</span>}
              <span>Joined {formatDate(student.createdAt)}</span>
              <span>{student._count.sessionAttendances} sessions attended</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <ActionButton url={`/api/admin/students/${student.id}`} method="PATCH" body={{ isActive: !student.isActive }} variant="outline" className="gap-2"
            confirmText={student.isActive ? `Suspend ${student.name}? They will not be able to sign in.` : undefined}>
            {student.isActive ? <><Ban className="h-4 w-4" />Suspend</> : <><CheckCircle className="h-4 w-4" />Reactivate</>}
          </ActionButton>
          <ActionButton url={`/api/admin/students/${student.id}`} method="DELETE" redirectTo="/admin/students"
            confirmText={`Permanently delete ${student.name} and all their progress, submissions and invoices?`}
            variant="outline" className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700">
            <Trash2 className="h-4 w-4" />Delete
          </ActionButton>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Enrollments &amp; Progress</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {student.enrollments.length === 0 && <p className="text-sm text-muted-foreground">Not enrolled in any course.</p>}
              {student.enrollments.map(e => {
                const lessonIds = e.course.modules.flatMap(m => m.lessons.map(l => l.id));
                const done = lessonIds.filter(l => completed.has(l)).length;
                const pct = calculateProgress(done, lessonIds.length);
                return (
                  <div key={e.id} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <Link href={`/admin/courses/${e.courseId}`} className="font-medium text-sm hover:underline">{e.course.title}</Link>
                        <p className="text-xs text-muted-foreground">Enrolled {formatDate(e.enrolledAt)} · {done}/{lessonIds.length} lessons</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <EnrollmentStatusSelect enrollmentId={e.id} status={e.status} />
                        <ActionButton url={`/api/admin/enrollments/${e.id}`} method="DELETE" size="sm" variant="ghost" className="text-red-500 hover:bg-red-50"
                          confirmText={`Unenroll ${student.name} from ${e.course.title}? Their progress is kept if re-enrolled.`}>
                          Unenroll
                        </ActionButton>
                      </div>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
              <div className="pt-2">
                <EnrollForm userId={student.id} courses={allCourses.filter(c => !enrolledIds.has(c.id))} />
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Quiz Attempts</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {student.quizAttempts.length === 0 ? <p className="text-sm text-muted-foreground">None yet.</p> : student.quizAttempts.map(a => {
                  const pct = Math.round((a.score / Math.max(a.maxScore, 1)) * 100);
                  return (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <div><p className="font-medium">{a.quiz.title}</p><p className="text-xs text-muted-foreground">{formatDate(a.completedAt)}</p></div>
                      <Badge variant={pct >= 75 ? 'success' : pct >= 50 ? 'warning' : 'destructive'}>{a.score}/{a.maxScore}</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Assignments</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {student.submissions.length === 0 ? <p className="text-sm text-muted-foreground">None yet.</p> : student.submissions.map(s => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <div><p className="font-medium">{s.assignment.title}</p><p className="text-xs text-muted-foreground">{formatDate(s.submittedAt)}</p></div>
                    {s.grade !== null
                      ? <Badge variant="success">{s.grade}/{s.assignment.maxMarks}</Badge>
                      : <Link href="/admin/content?tab=submissions"><Badge variant="warning">To grade</Badge></Link>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Invoices</CardTitle>
              <Link href={`/admin/payments/new?userId=${student.id}`} className="text-sm text-brand-600 hover:underline">+ New invoice</Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {student.invoices.length === 0 ? <p className="text-sm text-muted-foreground">No invoices.</p> : student.invoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between text-sm">
                  <div><p className="font-medium">{inv.description}</p><p className="text-xs text-muted-foreground">{formatDate(inv.issuedAt)}</p></div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatCurrency(inv.amount, inv.currency)}</span>
                    <Badge variant={invoiceVariant[inv.status]}>{inv.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader className="pb-3"><CardTitle className="text-base">Edit Details</CardTitle></CardHeader>
          <CardContent><EditStudentForm student={student} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
