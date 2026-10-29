'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/ui/native-select';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { apiFetch } from '@/lib/fetcher';

type SessionData = {
  id: string; courseId: string; title: string; description: string | null;
  scheduledAt: string; duration: number; meetLink: string | null;
};

export function SessionForm({ courses, session }: { courses: { id: string; title: string }[]; session?: SessionData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      courseId: fd.get('courseId'),
      title: fd.get('title'),
      description: fd.get('description'),
      scheduledAt: new Date(fd.get('scheduledAt') as string).toISOString(),
      duration: fd.get('duration'),
      meetLink: fd.get('meetLink'),
    };
    setLoading(true);
    setMsg(null);
    try {
      if (session) {
        await apiFetch(`/api/admin/sessions/${session.id}`, { method: 'PATCH', body });
        setMsg({ ok: true, text: 'Session updated.' });
        router.refresh();
      } else {
        const created = await apiFetch('/api/admin/sessions', { body });
        router.push(`/admin/sessions/${created.id}`);
      }
    } catch (err: any) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {msg && <div className={`text-sm rounded-md px-3 py-2 ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>{msg.text}</div>}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="courseId">Course</Label>
          <NativeSelect id="courseId" name="courseId" defaultValue={session?.courseId ?? ''} required>
            <option value="" disabled>Select a course…</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </NativeSelect>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title">Session title</Label>
          <Input id="title" name="title" defaultValue={session?.title} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="scheduledAt">Date &amp; time</Label>
          <DateTimeInput id="scheduledAt" name="scheduledAt" value={session?.scheduledAt} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input id="duration" name="duration" type="number" min={5} step={5} defaultValue={session?.duration ?? 60} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="meetLink">Meeting link</Label>
        <Input id="meetLink" name="meetLink" type="url" defaultValue={session?.meetLink ?? ''} placeholder="https://meet.google.com/… or Zoom link" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={session?.description ?? ''} />
      </div>
      <Button type="submit" variant="brand" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : session ? 'Save Changes' : 'Schedule Session'}
      </Button>
    </form>
  );
}

export function AttendanceForm({ sessionId, students }: {
  sessionId: string;
  students: { userId: string; name: string; email: string; attended: boolean }[];
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(() => new Set(students.filter(s => s.attended).map(s => s.userId)));
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(id: string) {
    setSaved(false);
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function save() {
    setLoading(true);
    try {
      await apiFetch(`/api/admin/sessions/${sessionId}/attendance`, { method: 'PUT', body: { attendedUserIds: Array.from(checked) } });
      setSaved(true);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (students.length === 0) return <p className="text-sm text-muted-foreground">No students are enrolled in this course.</p>;
  return (
    <div className="space-y-3">
      <ul className="divide-y border rounded-md">
        {students.map(s => (
          <li key={s.userId}>
            <label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={checked.has(s.userId)} onChange={() => toggle(s.userId)} className="h-4 w-4 accent-brand-600" />
              <span className="text-sm font-medium flex-1">{s.name}</span>
              <span className="text-xs text-muted-foreground">{s.email}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <Button size="sm" variant="brand" onClick={save} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save Attendance'}
        </Button>
        <span className="text-xs text-muted-foreground">{checked.size} of {students.length} present</span>
        {saved && <span className="text-xs text-emerald-600">Saved — session marked completed.</span>}
      </div>
    </div>
  );
}
