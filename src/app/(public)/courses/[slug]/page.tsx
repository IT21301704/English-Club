import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, CheckCircle, Clock, Layers, Users, Calendar } from 'lucide-react';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EnrollButton } from '@/components/public/enroll-button';
import { lessonIcons } from '@/components/admin/lesson-icons';
import { formatCurrency, formatDateTime } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

async function getCourse(slug: string) {
  return db.course.findFirst({
    where: { slug, isPublished: true },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: { lessons: { where: { isPublished: true }, orderBy: { order: 'asc' }, select: { id: true, title: true, type: true, duration: true } } },
      },
      sessions: { where: { scheduledAt: { gte: new Date() } }, orderBy: { scheduledAt: 'asc' }, take: 3 },
      _count: { select: { enrollments: true } },
    },
  }).catch(() => null);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourse((await params).slug);
  return course ? { title: course.title, description: course.description.slice(0, 160) } : {};
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();

  const user = await getSessionUser();
  const enrollment = user
    ? await db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } })
    : null;

  const lessons = course.modules.flatMap(m => m.lessons);
  const totalMinutes = lessons.reduce((s, l) => s + (l.duration ?? 0), 0);
  const syllabus = course.syllabus?.split('\n').map(s => s.trim()).filter(Boolean) ?? [];

  return (
    <div>
      <section className="section-padding page-hero">
        <div className="container-custom">
          <Link href="/courses" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-6">
            <ArrowLeft className="h-4 w-4" />All courses
          </Link>
          <div className="grid lg:grid-cols-[1fr_360px] gap-10 items-start">
            <div>
              <div className="flex gap-2 mb-4">
                <Badge variant="brand">{course.category}</Badge>
                <Badge variant="secondary">{course.level}</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl text-brand-950 mb-4">{course.title}</h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-6 whitespace-pre-line">{course.description}</p>
              <div className="flex flex-wrap gap-5 text-sm text-gray-600">
                {course.duration && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{course.duration}</span>}
                <span className="flex items-center gap-1.5"><Layers className="h-4 w-4" />{course.modules.length} modules · {lessons.length} lessons</span>
                {totalMinutes > 0 && <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" />{Math.round(totalMinutes / 60 * 10) / 10} hrs of content</span>}
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{course._count.enrollments} students</span>
              </div>
            </div>

            <Card className="shadow-xl overflow-hidden">
              <div className="h-44 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 flex items-center justify-center relative">
                {course.thumbnail
                  ? <Image src={course.thumbnail} alt="" fill className="object-cover" sizes="360px" />
                  : <BookOpen className="h-16 w-16 text-white/50" />}
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="text-3xl font-extrabold text-brand-700">
                  {course.price > 0 ? formatCurrency(course.price, course.currency) : 'Free'}
                </div>
                <EnrollButton
                  courseId={course.id} slug={course.slug} isLoggedIn={!!user} isFree={course.price <= 0}
                  status={enrollment?.status ?? null}
                />
                <ul className="space-y-2 text-sm text-gray-600 pt-2">
                  {['Recorded lessons & study notes', 'Live sessions with your trainer', 'Quizzes & graded assignments', 'Progress tracking in your portal'].map(f => (
                    <li key={f} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" />{f}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom grid lg:grid-cols-[1fr_360px] gap-10">
          <div className="space-y-10">
            {syllabus.length > 0 && (
              <div>
                <h2 className="text-2xl text-brand-950 mb-4">What you&apos;ll learn</h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {syllabus.map(item => (
                    <li key={item} className="flex items-start gap-2 text-gray-700"><CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {course.modules.length > 0 && (
              <div>
                <h2 className="text-2xl text-brand-950 mb-4">Course content</h2>
                <div className="space-y-3">
                  {course.modules.map((m, i) => (
                    <details key={m.id} className="rounded-lg border group" open={i === 0}>
                      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer bg-gray-50 rounded-lg font-medium">
                        <span>Module {i + 1}: {m.title}</span>
                        <span className="text-xs text-muted-foreground">{m.lessons.length} lessons</span>
                      </summary>
                      <ul className="divide-y">
                        {m.lessons.map(l => {
                          const Icon = lessonIcons[l.type];
                          return (
                            <li key={l.id} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700">
                              <Icon className="h-4 w-4 text-gray-400" />
                              <span className="flex-1">{l.title}</span>
                              {l.duration ? <span className="text-xs text-muted-foreground">{l.duration} min</span> : null}
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>

          {course.sessions.length > 0 && (
            <div>
              <h2 className="text-xl text-brand-950 mb-4">Upcoming live sessions</h2>
              <div className="space-y-3">
                {course.sessions.map(s => (
                  <div key={s.id} className="rounded-lg border p-4">
                    <p className="font-medium text-gray-900">{s.title}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Calendar className="h-3.5 w-3.5" />{formatDateTime(s.scheduledAt)} · {s.duration} min</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
