'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { TrainingPackage } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/fetcher';

export function PackageForm({ pkg, onDone }: { pkg?: TrainingPackage; onDone?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = {
      name: fd.get('name'),
      description: fd.get('description'),
      features: (fd.get('features') as string).split('\n').map(f => f.trim()).filter(Boolean),
      price: fd.get('price'),
      currency: fd.get('currency'),
      duration: fd.get('duration'),
      order: fd.get('order'),
      isPopular: fd.get('isPopular') === 'on',
      isActive: fd.get('isActive') === 'on',
    };
    setLoading(true);
    setError('');
    try {
      await apiFetch(pkg ? `/api/admin/packages/${pkg.id}` : '/api/admin/packages', { method: pkg ? 'PATCH' : 'POST', body });
      if (!pkg) form.reset();
      onDone?.();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2">{error}</div>}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Name</Label><Input name="name" defaultValue={pkg?.name} required /></div>
        <div className="space-y-1.5"><Label>Duration</Label><Input name="duration" defaultValue={pkg?.duration} placeholder="3 months" required /></div>
      </div>
      <div className="space-y-1.5"><Label>Short description</Label><Input name="description" defaultValue={pkg?.description} required /></div>
      <div className="space-y-1.5">
        <Label>Features <span className="text-muted-foreground font-normal">(one per line)</span></Label>
        <Textarea name="features" defaultValue={pkg?.features.join('\n')} required />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5"><Label>Price</Label><Input name="price" type="number" min={0} step="0.01" defaultValue={pkg?.price ?? ''} required /></div>
        <div className="space-y-1.5"><Label>Currency</Label><Input name="currency" defaultValue={pkg?.currency ?? 'LKR'} maxLength={3} required /></div>
        <div className="space-y-1.5"><Label>Sort order</Label><Input name="order" type="number" defaultValue={pkg?.order ?? 0} /></div>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={pkg?.isActive ?? true} className="h-4 w-4 accent-brand-600" />Shown on site</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPopular" defaultChecked={pkg?.isPopular} className="h-4 w-4 accent-brand-600" />&quot;Most popular&quot; badge</label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="brand" size="sm" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : pkg ? 'Save' : 'Add Package'}
        </Button>
        {onDone && <Button type="button" size="sm" variant="ghost" onClick={onDone}>Cancel</Button>}
      </div>
    </form>
  );
}

export function EditablePackage({ pkg, children }: { pkg: TrainingPackage; children: React.ReactNode }) {
  const [editing, setEditing] = useState(false);
  if (editing) return <PackageForm pkg={pkg} onDone={() => setEditing(false)} />;
  return (
    <div>
      {children}
      <Button size="sm" variant="outline" className="mt-3" onClick={() => setEditing(true)}>Edit</Button>
    </div>
  );
}
