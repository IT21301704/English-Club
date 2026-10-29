'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import type { Lesson, LessonType } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/ui/native-select';
import { FileUpload } from '@/components/ui/file-upload';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { apiFetch } from '@/lib/fetcher';

function useSave() {
  const router = useRouter();
  const [state, setState] = useState<{ loading: boolean; error: string; saved: boolean }>({ loading: false, error: '', saved: false });
  async function save(fn: () => Promise<unknown>) {
    setState({ loading: true, error: '', saved: false });
    try {
      await fn();
      setState({ loading: false, error: '', saved: true });
      router.refresh();
    } catch (e: any) {
      setState({ loading: false, error: e.message, saved: false });
    }
  }
  return { ...state, save };
}

function Status({ error, saved }: { error: string; saved: boolean }) {
  if (error) return <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2">{error}</div>;
  if (saved) return <div className="bg-emerald-50 text-emerald-700 text-sm rounded-md px-3 py-2">Saved.</div>;
  return null;
}

function SaveButton({ loading, label = 'Save' }: { loading: boolean; label?: string }) {
  return (
    <Button type="submit" variant="brand" disabled={loading}>
      {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : label}
    </Button>
  );
}

const ACCEPT: Partial<Record<LessonType, string>> = { VIDEO: 'video/*', PDF: 'application/pdf' };

export function LessonForm({ lesson }: { lesson: Lesson }) {
  const { loading, error, saved, save } = useSave();
  const [type, setType] = useState<LessonType>(lesson.type);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const duration = fd.get('duration');
    save(() => apiFetch(`/api/admin/lessons/${lesson.id}`, {
      method: 'PATCH',
      body: {
        title: fd.get('title'),
        type,
        contentUrl: fd.get('contentUrl'),
        description: fd.get('description'),
        duration: duration ? Number(duration) : null,
        isPublished: fd.get('isPublished') === 'on',
      },
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Status error={error} saved={saved} />
      <div className="grid md:grid-cols-[1fr_180px_140px] gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={lesson.title} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <NativeSelect id="type" value={type} onChange={e => setType(e.target.value as LessonType)}>
            <option value="VIDEO">Video</option>
            <option value="PDF">PDF / Notes</option>
            <option value="QUIZ">Quiz</option>
            <option value="ASSIGNMENT">Assignment</option>
          </NativeSelect>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="duration">Minutes</Label>
          <Input id="duration" name="duration" type="number" min={0} defaultValue={lesson.duration ?? ''} />
        </div>
      </div>

      {(type === 'VIDEO' || type === 'PDF') && (
        <div className="space-y-1.5">
          <Label>{type === 'VIDEO' ? 'Video (upload, or paste a YouTube / Vimeo / recording link)' : 'PDF file'}</Label>
          <FileUpload key={type} folder="lessons" name="contentUrl" value={lesson.contentUrl} accept={ACCEPT[type]} />
        </div>
      )}
      {(type === 'QUIZ' || type === 'ASSIGNMENT') && <input type="hidden" name="contentUrl" value={lesson.contentUrl ?? ''} />}

      <div className="space-y-1.5">
        <Label htmlFor="description">Description / notes for students</Label>
        <Textarea id="description" name="description" defaultValue={lesson.description ?? ''} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked={lesson.isPublished} className="h-4 w-4 accent-brand-600" />
        Visible to students
      </label>
      <SaveButton loading={loading} label="Save Lesson" />
    </form>
  );
}

type QuestionDraft = { question: string; options: string[]; correctIndex: number; explanation: string };

export function QuizEditor({ lessonId, quiz }: {
  lessonId: string;
  quiz: { title: string; timeLimit: number | null; passMark: number; questions: QuestionDraft[] } | null;
}) {
  const { loading, error, saved, save } = useSave();
  const [title, setTitle] = useState(quiz?.title ?? '');
  const [timeLimit, setTimeLimit] = useState(quiz?.timeLimit?.toString() ?? '');
  const [passMark, setPassMark] = useState(quiz?.passMark?.toString() ?? '50');
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    quiz?.questions.length ? quiz.questions : [{ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }]
  );

  const patch = (i: number, q: Partial<QuestionDraft>) => setQuestions(qs => qs.map((x, j) => (j === i ? { ...x, ...q } : x)));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    save(() => apiFetch(`/api/admin/lessons/${lessonId}/quiz`, {
      method: 'PUT',
      body: {
        title, passMark: Number(passMark), timeLimit: timeLimit ? Number(timeLimit) : null,
        questions: questions.map(q => {
          // Drop blank options but keep the correct answer pointing at the same text.
          const kept = q.options.map((o, idx) => ({ o: o.trim(), idx })).filter(x => x.o);
          return {
            question: q.question,
            options: kept.map(x => x.o),
            correctIndex: Math.max(0, kept.findIndex(x => x.idx === q.correctIndex)),
            explanation: q.explanation || null,
          };
        }),
      },
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Status error={error} saved={saved} />
      <div className="grid md:grid-cols-[1fr_140px_140px] gap-4">
        <div className="space-y-1.5">
          <Label>Quiz title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Pass mark (%)</Label>
          <Input type="number" min={0} max={100} value={passMark} onChange={e => setPassMark(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Time limit (min)</Label>
          <Input type="number" min={1} value={timeLimit} onChange={e => setTimeLimit(e.target.value)} placeholder="None" />
        </div>
      </div>

      {questions.map((q, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3 bg-gray-50/50">
          <div className="flex items-start gap-2">
            <span className="text-sm font-semibold text-muted-foreground pt-2 w-8">Q{i + 1}</span>
            <Textarea value={q.question} onChange={e => patch(i, { question: e.target.value })} placeholder="Question" className="min-h-[60px]" required />
            <Button type="button" size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" disabled={questions.length === 1}
              onClick={() => setQuestions(qs => qs.filter((_, j) => j !== i))} aria-label="Remove question">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-2 pl-10">
            {q.options.map((opt, oi) => (
              <label key={oi} className="flex items-center gap-2">
                <input type="radio" name={`correct-${i}`} checked={q.correctIndex === oi} onChange={() => patch(i, { correctIndex: oi })}
                  className="h-4 w-4 accent-emerald-600" aria-label={`Mark option ${oi + 1} correct`} />
                <Input value={opt} placeholder={`Option ${oi + 1}${oi < 2 ? '' : ' (optional)'}`} required={oi < 2} className="h-9"
                  onChange={e => patch(i, { options: q.options.map((o, k) => (k === oi ? e.target.value : o)) })} />
              </label>
            ))}
          </div>
          <div className="pl-10">
            <Input value={q.explanation} onChange={e => patch(i, { explanation: e.target.value })} placeholder="Explanation shown after submitting (optional)" className="h-9" />
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="gap-1"
          onClick={() => setQuestions(qs => [...qs, { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }])}>
          <Plus className="h-4 w-4" />Add Question
        </Button>
        <SaveButton loading={loading} label="Save Quiz" />
      </div>
      <p className="text-xs text-muted-foreground">Select the radio button next to the correct option. Saving replaces all questions; previous attempts are kept.</p>
    </form>
  );
}

export function AssignmentForm({ lessonId, assignment }: {
  lessonId: string;
  assignment: { title: string; description: string; dueDate: string | null; maxMarks: number } | null;
}) {
  const { loading, error, saved, save } = useSave();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const due = fd.get('dueDate') as string;
    save(() => apiFetch(`/api/admin/lessons/${lessonId}/assignment`, {
      method: 'PUT',
      body: {
        title: fd.get('title'),
        description: fd.get('description'),
        maxMarks: fd.get('maxMarks'),
        dueDate: due ? new Date(due).toISOString() : null,
      },
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Status error={error} saved={saved} />
      <div className="grid md:grid-cols-[1fr_220px_120px] gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="a-title">Assignment title</Label>
          <Input id="a-title" name="title" defaultValue={assignment?.title} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="a-due">Due date</Label>
          <DateTimeInput id="a-due" name="dueDate" value={assignment?.dueDate} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="a-max">Max marks</Label>
          <Input id="a-max" name="maxMarks" type="number" min={1} defaultValue={assignment?.maxMarks ?? 100} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="a-desc">Instructions</Label>
        <Textarea id="a-desc" name="description" defaultValue={assignment?.description} className="min-h-[140px]" required />
      </div>
      <SaveButton loading={loading} label="Save Assignment" />
    </form>
  );
}
