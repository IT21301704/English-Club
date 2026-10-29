'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowDown, Trash2, Plus, Pencil, EyeOff, Check, X } from 'lucide-react';
import type { LessonType } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { NativeSelect } from '@/components/ui/native-select';
import { ActionButton } from '@/components/admin/action-button';
import { apiFetch } from '@/lib/fetcher';
import { lessonIcons } from '@/components/admin/lesson-icons';

type CurriculumModule = {
  id: string;
  title: string;
  lessons: { id: string; title: string; type: LessonType; isPublished: boolean; contentUrl: string | null; hasQuiz: boolean; hasAssignment: boolean }[];
};

export function CurriculumEditor({ courseId, modules }: { courseId: string; modules: CurriculumModule[] }) {
  const router = useRouter();
  const [newModule, setNewModule] = useState('');
  const [error, setError] = useState('');

  async function addModule(e: React.FormEvent) {
    e.preventDefault();
    if (!newModule.trim()) return;
    try {
      await apiFetch(`/api/admin/courses/${courseId}/modules`, { body: { title: newModule } });
      setNewModule('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2">{error}</div>}
      {modules.length === 0 && <p className="text-sm text-muted-foreground">No modules yet. Add the first module below.</p>}

      {modules.map((mod, i) => (
        <ModuleCard key={mod.id} courseId={courseId} mod={mod} index={i} isLast={i === modules.length - 1} onError={setError} />
      ))}

      <form onSubmit={addModule} className="flex gap-2">
        <Input value={newModule} onChange={e => setNewModule(e.target.value)} placeholder="New module title, e.g. Week 1 — Algebra" />
        <Button type="submit" variant="brand" className="gap-1"><Plus className="h-4 w-4" />Add Module</Button>
      </form>
    </div>
  );
}

function ModuleCard({ courseId, mod, index, isLast, onError }: {
  courseId: string; mod: CurriculumModule; index: number; isLast: boolean; onError: (m: string) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(mod.title);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<LessonType>('VIDEO');

  async function rename() {
    try {
      await apiFetch(`/api/admin/modules/${mod.id}`, { method: 'PATCH', body: { title } });
      setEditing(false);
      router.refresh();
    } catch (err: any) { onError(err.message); }
  }

  async function addLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!lessonTitle.trim()) return;
    try {
      const lesson = await apiFetch(`/api/admin/modules/${mod.id}/lessons`, { body: { title: lessonTitle, type: lessonType } });
      setLessonTitle('');
      router.push(`/admin/courses/${courseId}/lessons/${lesson.id}`);
    } catch (err: any) { onError(err.message); }
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50 rounded-t-lg">
        <span className="text-xs font-semibold text-muted-foreground w-16">Module {index + 1}</span>
        {editing ? (
          <>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="h-8" autoFocus />
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={rename} aria-label="Save title"><Check className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(false); setTitle(mod.title); }} aria-label="Cancel"><X className="h-4 w-4" /></Button>
          </>
        ) : (
          <>
            <span className="font-semibold text-gray-900 flex-1">{mod.title}</span>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(true)} aria-label="Rename module"><Pencil className="h-3.5 w-3.5" /></Button>
          </>
        )}
        <ActionButton url={`/api/admin/modules/${mod.id}`} method="PATCH" body={{ move: 'up' }} size="icon" variant="ghost" className="h-8 w-8" disabled={index === 0} aria-label="Move module up"><ArrowUp className="h-3.5 w-3.5" /></ActionButton>
        <ActionButton url={`/api/admin/modules/${mod.id}`} method="PATCH" body={{ move: 'down' }} size="icon" variant="ghost" className="h-8 w-8" disabled={isLast} aria-label="Move module down"><ArrowDown className="h-3.5 w-3.5" /></ActionButton>
        <ActionButton url={`/api/admin/modules/${mod.id}`} method="DELETE" confirmText={`Delete module "${mod.title}" and all ${mod.lessons.length} lessons in it?`} size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" aria-label="Delete module"><Trash2 className="h-3.5 w-3.5" /></ActionButton>
      </div>

      <ul className="divide-y">
        {mod.lessons.map((lesson, li) => {
          const Icon = lessonIcons[lesson.type];
          const missing =
            (lesson.type === 'QUIZ' && !lesson.hasQuiz) ? 'No questions yet' :
            (lesson.type === 'ASSIGNMENT' && !lesson.hasAssignment) ? 'Not configured' :
            ((lesson.type === 'VIDEO' || lesson.type === 'PDF') && !lesson.contentUrl) ? 'No file' : null;
          return (
            <li key={lesson.id} className="flex items-center gap-3 px-4 py-2.5">
              <Icon className="h-4 w-4 text-brand-600 flex-shrink-0" />
              <Link href={`/admin/courses/${courseId}/lessons/${lesson.id}`} className="text-sm flex-1 hover:text-brand-700 hover:underline">{lesson.title}</Link>
              {!lesson.isPublished && <Badge variant="secondary" className="gap-1"><EyeOff className="h-3 w-3" />Hidden</Badge>}
              {missing && <Badge variant="warning">{missing}</Badge>}
              <ActionButton url={`/api/admin/lessons/${lesson.id}`} method="PATCH" body={{ move: 'up' }} size="icon" variant="ghost" className="h-7 w-7" disabled={li === 0} aria-label="Move lesson up"><ArrowUp className="h-3 w-3" /></ActionButton>
              <ActionButton url={`/api/admin/lessons/${lesson.id}`} method="PATCH" body={{ move: 'down' }} size="icon" variant="ghost" className="h-7 w-7" disabled={li === mod.lessons.length - 1} aria-label="Move lesson down"><ArrowDown className="h-3 w-3" /></ActionButton>
              <ActionButton url={`/api/admin/lessons/${lesson.id}`} method="DELETE" confirmText={`Delete lesson "${lesson.title}"? Student progress for it will be lost.`} size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50" aria-label="Delete lesson"><Trash2 className="h-3 w-3" /></ActionButton>
            </li>
          );
        })}
      </ul>

      <form onSubmit={addLesson} className="flex gap-2 p-3 border-t bg-gray-50/50 rounded-b-lg">
        <Input value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} placeholder="New lesson title" className="h-9" />
        <NativeSelect value={lessonType} onChange={e => setLessonType(e.target.value as LessonType)} className="h-9 w-40">
          <option value="VIDEO">Video</option>
          <option value="PDF">PDF / Notes</option>
          <option value="QUIZ">Quiz</option>
          <option value="ASSIGNMENT">Assignment</option>
        </NativeSelect>
        <Button type="submit" size="sm" variant="outline" className="gap-1"><Plus className="h-3.5 w-3.5" />Add Lesson</Button>
      </form>
    </div>
  );
}
