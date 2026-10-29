'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { Course } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/ui/native-select';
import { FileUpload } from '@/components/ui/file-upload';
import { apiFetch } from '@/lib/fetcher';

export function CourseForm({ course }: { course?: Course }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get('title'),
      slug: fd.get('slug'),
      description: fd.get('description'),
      syllabus: fd.get('syllabus'),
      thumbnail: fd.get('thumbnail'),
      category: fd.get('category'),
      level: fd.get('level'),
      duration: fd.get('duration'),
      price: fd.get('price'),
      currency: fd.get('currency'),
      isPublished: fd.get('isPublished') === 'on',
      isFeatured: fd.get('isFeatured') === 'on',
    };
    try {
      if (course) {
        await apiFetch(`/api/admin/courses/${course.id}`, { method: 'PATCH', body });
        setSaved(true);
        router.refresh();
      } else {
        const created = await apiFetch('/api/admin/courses', { body });
        router.push(`/admin/courses/${created.id}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2">{error}</div>}
      {saved && <div className="bg-emerald-50 text-emerald-700 text-sm rounded-md px-3 py-2">Course saved.</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={course?.title} required minLength={3} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">URL slug</Label>
          <Input id="slug" name="slug" defaultValue={course?.slug} placeholder="Generated from title if empty" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={course?.description} required minLength={10} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="syllabus">Syllabus <span className="text-muted-foreground font-normal">(one topic per line)</span></Label>
        <Textarea id="syllabus" name="syllabus" defaultValue={course?.syllabus ?? ''} className="min-h-[140px]" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={course?.category} required placeholder="Mathematics" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="level">Level</Label>
          <NativeSelect id="level" name="level" defaultValue={course?.level ?? 'Beginner'}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </NativeSelect>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="duration">Duration</Label>
          <Input id="duration" name="duration" defaultValue={course?.duration ?? ''} placeholder="3 months" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" type="number" min={0} step="0.01" defaultValue={course?.price ?? 0} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" name="currency" defaultValue={course?.currency ?? 'LKR'} maxLength={3} required />
        </div>
        <div className="flex items-end gap-6 pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublished" defaultChecked={course?.isPublished} className="h-4 w-4 accent-brand-600" />Published
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isFeatured" defaultChecked={course?.isFeatured} className="h-4 w-4 accent-brand-600" />Featured
          </label>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Thumbnail image</Label>
        <FileUpload folder="thumbnails" name="thumbnail" value={course?.thumbnail} accept="image/*" />
      </div>

      <Button type="submit" variant="brand" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : course ? 'Save Changes' : 'Create Course'}
      </Button>
    </form>
  );
}
