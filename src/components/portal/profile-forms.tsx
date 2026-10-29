'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/ui/native-select';
import { FileUpload } from '@/components/ui/file-upload';
import { apiFetch } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

function Msg({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return <div className={`text-sm rounded-md px-3 py-2 ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>{msg.text}</div>;
}

export function ProfileForm({ user }: { user: { name: string; email: string; phone: string | null; bio: string | null; avatar: string | null } }) {
  const router = useRouter();
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setMsg(null);
    try {
      await apiFetch('/api/profile', { method: 'PATCH', body: { name: fd.get('name'), phone: fd.get('phone'), bio: fd.get('bio'), avatar: fd.get('avatar') } });
      await update();
      setMsg({ ok: true, text: 'Profile updated.' });
      router.refresh();
    } catch (err: any) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Msg msg={msg} />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" name="name" defaultValue={user.name} required minLength={2} /></div>
        <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" value={user.email} disabled /></div>
        <div className="space-y-1.5"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" defaultValue={user.phone ?? ''} /></div>
      </div>
      <div className="space-y-1.5"><Label htmlFor="bio">About you</Label><Textarea id="bio" name="bio" defaultValue={user.bio ?? ''} /></div>
      <div className="space-y-1.5">
        <Label>Profile photo</Label>
        <FileUpload folder="avatars" name="avatar" value={user.avatar} accept="image/*" allowUrl={false} />
      </div>
      <Button type="submit" variant="brand" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Profile'}</Button>
    </form>
  );
}

export function PasswordForm() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get('newPassword') !== fd.get('confirm')) {
      setMsg({ ok: false, text: 'New passwords do not match.' });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await apiFetch('/api/profile/password', { body: { currentPassword: fd.get('currentPassword'), newPassword: fd.get('newPassword') } });
      form.reset();
      setMsg({ ok: true, text: 'Password changed.' });
    } catch (err: any) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Msg msg={msg} />
      <div className="space-y-1.5"><Label htmlFor="currentPassword">Current password</Label><Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" /></div>
      <div className="space-y-1.5"><Label htmlFor="newPassword">New password</Label><Input id="newPassword" name="newPassword" type="password" required minLength={8} autoComplete="new-password" /></div>
      <div className="space-y-1.5"><Label htmlFor="confirm">Confirm new password</Label><Input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" /></div>
      <Button type="submit" variant="outline" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Change Password'}</Button>
    </form>
  );
}

export function TestimonialForm({ courses }: { courses: string[] }) {
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setLoading(true);
    setMsg(null);
    try {
      await apiFetch('/api/testimonials', { body: { content: fd.get('content'), course: fd.get('course'), rating } });
      form.reset();
      setMsg({ ok: true, text: 'Thank you! Your story will appear on the site once approved.' });
    } catch (err: any) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Msg msg={msg} />
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`} aria-checked={rating === n} role="radio">
            <Star className={cn('h-6 w-6', n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')} />
          </button>
        ))}
      </div>
      {courses.length > 0 && (
        <NativeSelect name="course" defaultValue="" aria-label="Course">
          <option value="">General</option>
          {courses.map(c => <option key={c} value={c}>{c}</option>)}
        </NativeSelect>
      )}
      <Textarea name="content" required minLength={20} maxLength={1000} placeholder="How has learning here helped you?" />
      <Button type="submit" variant="outline" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Testimonial'}</Button>
    </form>
  );
}
