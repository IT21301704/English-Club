import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Download, Lock } from 'lucide-react';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MarkCompleteButton, QuizRunner, SubmissionForm } from '@/components/portal/lesson-actions';
import { lessonIcons, lessonTypeLabels } from '@/components/admin/lesson-icons';
import { getEmbedUrl } from '@/lib/embed';
import { calculateProgress, cn, formatCurrency, formatDateTime } from '@/lib/utils';

export default async function CoursePlayerPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const { id: courseId } = await params;
  const { lesson: lessonParam } = await searchParams;

  const [course, enrollment] = await Promise.all([
    db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: { lessons: { where: { isPublished: true }, orderBy: { order: 'asc' } } },
        },
      },
    }),
    db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId } } }),
  ]);
  if (!course) notFound();

  const isAdmin = user.role === 'ADMIN';
  const hasAccess = isAdmin || (enrollment && (enrollment.status === 'ACTIVE' || enrollment.status === 'COMPLETED'));
  if (!hasAccess) return <NoAccess course={course} status={enrollment?.status} userId={user.id} />;

  const lessons = course.modules.flatMap(m => m.lessons);
  const progress = await db.progress.findMany({ where: { userId: user.id, lessonId: { in: lessons.map(l => l.id) } }, select: { lessonId: true } });
  const done = new Set(progress.map(p => p.lessonId));
  const pct = calculateProgress(done.size, lessons.length);

  // Default to the first lesson not yet completed.
  const current = lessons.find(l => l.id === lessonParam) ?? lessons.find(l => !done.has(l.id)) ?? lessons[0];
  const idx = current ? lessons.indexOf(current) : -1;
  const prev = idx > 0 ? lessons[idx - 1] : undefined;
  const next = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : undefined;
  const href = (lessonId: string) => `/portal/courses/${courseId}?lesson=${lessonId}`;

  return (
    <div className="space-y-4">
      <Link href="/portal/courses" className="text-sm text-muted-foreground hover:text-gray-900 flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" />My courses
      </Link>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-4 min-w-0">
          {!current ? (
            <Card><CardContent className="py-16 text-center text-muted-foreground">Lessons for this course will appear here soon.</CardContent></Card>
          ) : (
            <>
              <div>
                <p className="text-sm text-muted-foreground">{course.title}</p>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {current.title}
                  {done.has(current.id) && <CheckCircle className="h-5 w-5 text-emerald-500" aria-label="Completed" />}
                </h2>
                <div className="flex gap-2 mt-1">
                  <Badge variant="brand">{lessonTypeLabels[current.type]}</Badge>
                  {current.duration ? <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{current.duration} min</Badge> : null}
                </div>
              </div>

              <LessonBody lesson={current} userId={user.id} completed={done.has(current.id)} nextHref={next ? href(next.id) : undefined} />

              <div className="flex justify-between pt-2">
                {prev ? <Link href={href(prev.id)}><Button variant="outline" className="gap-1"><ArrowLeft className="h-4 w-4" />Previous</Button></Link> : <span />}
                {next && <Link href={href(next.id)}><Button variant="outline" className="gap-1">Next<ArrowRight className="h-4 w-4" /></Button></Link>}
              </div>
            </>
          )}
        </div>

        <Card className="lg:sticky lg:top-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{course.title}</CardTitle>
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs text-muted-foreground"><span>{done.size}/{lessons.length} lessons</span><span>{pct}%</span></div>
              <Progress value={pct} className="h-2" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pb-2 max-h-[60vh] overflow-y-auto">
            {course.modules.filter(m => m.lessons.length > 0).map((m, mi) => (
              <div key={m.id}>
                <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase text-muted-foreground">Module {mi + 1} · {m.title}</p>
                {m.lessons.map(l => {
                  const Icon = lessonIcons[l.type];
                  return (
                    <Link key={l.id} href={href(l.id)}
                      className={cn('flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50',
                        current?.id === l.id && 'bg-brand-50 text-brand-700 font-medium border-l-2 border-brand-600')}>
                      {done.has(l.id) ? <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" /> : <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                      <span className="truncate">{l.title}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function LessonBody({ lesson, userId, completed, nextHref }: {
  lesson: { id: string; type: string; contentUrl: string | null; description: string | null };
  userId: string; completed: boolean; nextHref?: string;
}) {
  const description = lesson.description && (
    <Card><CardContent className="p-5 text-sm text-gray-700 whitespace-pre-wrap">{lesson.description}</CardContent></Card>
  );

  if (lesson.type === 'VIDEO' || lesson.type === 'PDF') {
    const embed = lesson.contentUrl ? getEmbedUrl(lesson.contentUrl) : null;
    return (
      <div className="space-y-4">
        {!lesson.contentUrl ? (
          <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Content for this lesson hasn&apos;t been uploaded yet.</CardContent></Card>
        ) : lesson.type === 'VIDEO' ? (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {embed
              ? <iframe src={embed} className="w-full h-full" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen title="Lesson video" />
              : <video src={lesson.contentUrl} controls controlsList="nodownload" className="w-full h-full" />}
          </div>
        ) : (
          <div className="space-y-2">
            <iframe src={embed ?? lesson.contentUrl} className="w-full h-[75vh] rounded-lg border bg-white" title="Lesson notes" />
            <a href={lesson.contentUrl} target="_blank" rel="noreferrer" className="inline-flex">
              <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" />Open / download PDF</Button>
            </a>
          </div>
        )}
        {description}
        <MarkCompleteButton lessonId={lesson.id} completed={completed} nextHref={nextHref} />
      </div>
    );
  }

  if (lesson.type === 'QUIZ') {
    const quiz = await db.quiz.findFirst({
      where: { lessonId: lesson.id },
      // correctIndex/explanation are deliberately not selected — grading happens server-side.
      include: { questions: { orderBy: { order: 'asc' }, select: { id: true, question: true, options: true } } },
    });
    const attempts = quiz
      ? await db.quizAttempt.findMany({ where: { quizId: quiz.id, userId }, orderBy: { completedAt: 'desc' }, take: 5 })
      : [];
    return (
      <div className="space-y-4">
        {description}
        {attempts.length > 0 && (
          <Card>
            <CardContent className="p-4 text-sm flex flex-wrap gap-2 items-center">
              <span className="text-muted-foreground">Your attempts:</span>
              {attempts.map(a => (
                <Badge key={a.id} variant={(a.score / Math.max(a.maxScore, 1)) * 100 >= (quiz?.passMark ?? 50) ? 'success' : 'secondary'}>
                  {a.score}/{a.maxScore}
                </Badge>
              ))}
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-5">
            {quiz && quiz.questions.length > 0
              ? <QuizRunner quiz={{ id: quiz.id, title: quiz.title, passMark: quiz.passMark, timeLimit: quiz.timeLimit, questions: quiz.questions }} />
              : <p className="text-sm text-muted-foreground text-center py-8">This quiz isn&apos;t ready yet.</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ASSIGNMENT
  const assignment = await db.assignment.findFirst({ where: { lessonId: lesson.id } });
  if (!assignment) {
    return <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">This assignment isn&apos;t ready yet.</CardContent></Card>;
  }
  const submission = await db.submission.findUnique({ where: { assignmentId_userId: { assignmentId: assignment.id, userId } } });
  const overdue = assignment.dueDate && assignment.dueDate < new Date() && !submission;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary">Max marks: {assignment.maxMarks}</Badge>
            {assignment.dueDate && <Badge variant={overdue ? 'destructive' : 'warning'}>Due {formatDateTime(assignment.dueDate)}</Badge>}
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
        </CardContent>
      </Card>
      {description}
      {submission?.status === 'GRADED' && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-5 space-y-1">
            <p className="font-semibold">Grade: {submission.grade} / {assignment.maxMarks}</p>
            {submission.feedback && <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.feedback}</p>}
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Your Submission</CardTitle></CardHeader>
        <CardContent>
          <SubmissionForm assignmentId={assignment.id} submission={submission && {
            fileUrl: submission.fileUrl, textContent: submission.textContent, status: submission.status,
            grade: submission.grade, feedback: submission.feedback,
          }} />
        </CardContent>
      </Card>
      {!completed && submission && (
        <MarkCompleteButton lessonId={lesson.id} completed={false} nextHref={nextHref} />
      )}
    </div>
  );
}

async function NoAccess({ course, status, userId }: { course: { id: string; title: string; slug: string; price: number; currency: string }; status?: string; userId: string }) {
  const invoice = status === 'PENDING'
    ? await db.invoice.findFirst({ where: { userId, courseId: course.id, status: { in: ['PENDING', 'OVERDUE'] } }, orderBy: { issuedAt: 'desc' } })
    : null;
  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardContent className="py-12 text-center space-y-4">
        <Lock className="h-12 w-12 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold">{course.title}</h2>
        {status === 'PENDING' ? (
          <>
            <p className="text-sm text-muted-foreground">Your enrollment is awaiting payment of {formatCurrency(course.price, course.currency)}. You&apos;ll get access as soon as it&apos;s confirmed.</p>
            {invoice && <Link href={`/invoice/${invoice.id}`}><Button variant="brand">View invoice &amp; payment details</Button></Link>}
          </>
        ) : status === 'SUSPENDED' ? (
          <p className="text-sm text-muted-foreground">Your access to this course is suspended. Please contact your trainer.</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">You&apos;re not enrolled in this course.</p>
            <Link href={`/courses/${course.slug}`}><Button variant="brand">View course</Button></Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
