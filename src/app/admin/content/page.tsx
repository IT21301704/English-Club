import Link from 'next/link';
import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GradeForm } from '@/components/admin/grade-form';
import { lessonIcons } from '@/components/admin/lesson-icons';
import { formatDateTime, cn } from '@/lib/utils';
import type { LessonType } from '@prisma/client';

const TABS = [
  { key: 'submissions', label: 'Submissions' },
  { key: 'library', label: 'Content Library' },
] as const;

const TYPE_FILTERS: (LessonType | 'ALL')[] = ['ALL', 'VIDEO', 'PDF', 'QUIZ', 'ASSIGNMENT'];

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ tab?: string; type?: string; show?: string }> }) {
  const sp = await searchParams;
  const tab = sp.tab === 'library' ? 'library' : 'submissions';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Content</h2>
        <p className="text-muted-foreground">Grade submissions and browse every lesson across your courses. Upload content from a course&apos;s curriculum.</p>
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map(t => (
          <Link key={t.key} href={`/admin/content?tab=${t.key}`}
            className={cn('px-4 py-2 text-sm font-medium border-b-2 -mb-px',
              tab === t.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-muted-foreground hover:text-gray-900')}>
            {t.label}
          </Link>
        ))}
      </div>

      {tab === 'submissions'
        ? <Submissions showAll={sp.show === 'all'} />
        : <Library type={TYPE_FILTERS.includes(sp.type as any) ? (sp.type as LessonType | 'ALL') : 'ALL'} />}
    </div>
  );
}

async function Submissions({ showAll }: { showAll: boolean }) {
  const submissions = await db.submission.findMany({
    where: showAll ? {} : { status: 'SUBMITTED' },
    include: {
      user: { select: { name: true, email: true } },
      assignment: { include: { lesson: { include: { module: { include: { course: { select: { title: true } } } } } } } },
    },
    orderBy: { submittedAt: showAll ? 'desc' : 'asc' },
    take: 100,
  }).catch(() => []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm">
        <Link href="/admin/content?tab=submissions" className={!showAll ? 'font-semibold text-brand-700' : 'text-muted-foreground hover:underline'}>Awaiting grading</Link>
        <span className="text-gray-300">|</span>
        <Link href="/admin/content?tab=submissions&show=all" className={showAll ? 'font-semibold text-brand-700' : 'text-muted-foreground hover:underline'}>All submissions</Link>
      </div>

      {submissions.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">
          {showAll ? 'No submissions yet.' : 'Nothing to grade — all caught up.'}
        </CardContent></Card>
      ) : submissions.map(s => {
        const late = s.assignment.dueDate && s.submittedAt > s.assignment.dueDate;
        return (
          <Card key={s.id}>
            <CardContent className="p-5 grid lg:grid-cols-[1fr_320px] gap-6">
              <div className="space-y-3 min-w-0">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{s.assignment.title}</h3>
                    <Badge variant={s.status === 'GRADED' ? 'success' : 'warning'}>{s.status}</Badge>
                    {late && <Badge variant="destructive">Late</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {s.assignment.lesson.module.course.title} · {s.user.name} ({s.user.email}) · submitted {formatDateTime(s.submittedAt)}
                  </p>
                </div>
                {s.textContent && <div className="text-sm whitespace-pre-wrap bg-gray-50 rounded-md p-3 border max-h-64 overflow-y-auto">{s.textContent}</div>}
                {s.fileUrl && <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">Open attached file ↗</a>}
              </div>
              <GradeForm submissionId={s.id} maxMarks={s.assignment.maxMarks} grade={s.grade} feedback={s.feedback} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

async function Library({ type }: { type: LessonType | 'ALL' }) {
  const lessons = await db.lesson.findMany({
    where: type === 'ALL' ? {} : { type },
    include: { module: { include: { course: { select: { id: true, title: true } } } } },
    orderBy: [{ module: { course: { title: 'asc' } } }, { module: { order: 'asc' } }, { order: 'asc' }],
  }).catch(() => []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map(t => (
          <Link key={t} href={`/admin/content?tab=library&type=${t}`}>
            <Badge variant={type === t ? 'brand' : 'secondary'} className="cursor-pointer">{t === 'ALL' ? 'All' : t}</Badge>
          </Link>
        ))}
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                {['Lesson', 'Course / Module', 'Type', 'Content'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {lessons.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-sm text-muted-foreground">No lessons yet. Create a course and add modules to start.</td></tr>
              ) : lessons.map(l => {
                const Icon = lessonIcons[l.type];
                return (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/courses/${l.module.course.id}/lessons/${l.id}`} className="text-sm font-medium hover:text-brand-700 hover:underline flex items-center gap-2">
                        <Icon className="h-4 w-4 text-brand-600" />{l.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{l.module.course.title} <span className="text-muted-foreground">/ {l.module.title}</span></td>
                    <td className="px-4 py-3"><Badge variant="secondary">{l.type}</Badge></td>
                    <td className="px-4 py-3 text-sm">
                      {l.contentUrl
                        ? <a href={l.contentUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Open ↗</a>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
