'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { apiFetch } from '@/lib/fetcher';

type CourseOption = { id: string; title: string };

export function NewStudentForm({ courses }: { courses: CourseOption[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError('');
    try {
      const user = await apiFetch('/api/admin/students', {
        body: {
          name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'), password: fd.get('password'),
          courseIds: fd.getAll('courseIds'),
        },
      });
      router.push(`/admin/students/${user.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2">{error}</div>}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" name="name" required minLength={2} /></div>
        <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
        <div className="space-y-1.5"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" /></div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Initial password</Label>
          <Input id="password" name="password" type="text" required minLength={8} placeholder="Min. 8 characters — share it with the student" />
        </div>
      </div>
      {courses.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium mb-1">Enroll in courses</legend>
          <div className="grid sm:grid-cols-2 gap-2">
            {courses.map(c => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="courseIds" value={c.id} className="h-4 w-4 accent-brand-600" />{c.title}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <Button type="submit" variant="brand" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : 'Create Student'}
      </Button>
    </form>
  );
}

export function EditStudentForm({ student }: { student: { id: string; name: string; email: string; phone: string | null } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const password = (fd.get('password') as string) || undefined;
    setLoading(true);
    setMsg(null);
    try {
      await apiFetch(`/api/admin/students/${student.id}`, {
        method: 'PATCH',
        body: { name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'), password },
      });
      (form.elements.namedItem('password') as HTMLInputElement).value = '';
      setMsg({ ok: true, text: password ? 'Saved. Password has been reset.' : 'Saved.' });
      router.refresh();
    } catch (err: any) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {msg && <div className={`text-sm rounded-md px-3 py-2 ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>{msg.text}</div>}
      <div className="space-y-1.5"><Label htmlFor="name">Name</Label><Input id="name" name="name" defaultValue={student.name} required /></div>
      <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" defaultValue={student.email} required /></div>
      <div className="space-y-1.5"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" defaultValue={student.phone ?? ''} /></div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Reset password</Label>
        <Input id="password" name="password" type="text" minLength={8} placeholder="Leave blank to keep current" />
      </div>
      <Button type="submit" variant="brand" size="sm" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
      </Button>
    </form>
  );
}

export function EnrollForm({ userId, courses }: { userId: string; courses: CourseOption[] }) {
  const router = useRouter();
  const [courseId, setCourseId] = useState('');
  const [loading, setLoading] = useState(false);

  async function enroll() {
    if (!courseId) return;
    setLoading(true);
    try {
      await apiFetch('/api/admin/enrollments', { body: { userId, courseId } });
      setCourseId('');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (courses.length === 0) return <p className="text-xs text-muted-foreground">Enrolled in every course.</p>;
  return (
    <div className="flex gap-2">
      <NativeSelect value={courseId} onChange={e => setCourseId(e.target.value)} className="h-9" aria-label="Course to enroll in">
        <option value="">Select a course…</option>
        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
      </NativeSelect>
      <Button size="sm" variant="brand" onClick={enroll} disabled={!courseId || loading}>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Enroll'}
      </Button>
    </div>
  );
}

export function EnrollmentStatusSelect({ enrollmentId, status }: { enrollmentId: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);

  async function change(next: string) {
    setValue(next);
    try {
      await apiFetch(`/api/admin/enrollments/${enrollmentId}`, { method: 'PATCH', body: { status: next } });
      router.refresh();
    } catch (err: any) {
      setValue(status);
      alert(err.message);
    }
  }

  return (
    <NativeSelect value={value} onChange={e => change(e.target.value)} className="h-8 w-36 text-xs" aria-label="Enrollment status">
      <option value="PENDING">Pending payment</option>
      <option value="ACTIVE">Active</option>
      <option value="COMPLETED">Completed</option>
      <option value="SUSPENDED">Suspended</option>
    </NativeSelect>
  );
}
