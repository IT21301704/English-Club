'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Clock, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { apiFetch } from '@/lib/fetcher';

type Student = { id: string; name: string; email: string };
type Course = { id: string; title: string; price: number; currency: string };

export function NewInvoiceForm({ students, courses, defaultUserId }: { students: Student[]; courses: Course[]; defaultUserId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courseId, setCourseId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('LKR');
  const [description, setDescription] = useState('');
  const [markPaid, setMarkPaid] = useState(false);

  function pickCourse(id: string) {
    setCourseId(id);
    const c = courses.find(c => c.id === id);
    if (c) {
      setAmount(String(c.price));
      setCurrency(c.currency);
      setDescription(`Course fee — ${c.title}`);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const due = fd.get('dueDate') as string;
    setLoading(true);
    setError('');
    try {
      await apiFetch('/api/admin/invoices', {
        body: {
          userId: fd.get('userId'), courseId: courseId || null, amount, currency, description,
          dueDate: due ? new Date(due).toISOString() : null,
          markPaid, paymentRef: fd.get('paymentRef'),
        },
      });
      router.push('/admin/payments');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2">{error}</div>}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="userId">Student</Label>
          <NativeSelect id="userId" name="userId" defaultValue={defaultUserId ?? ''} required>
            <option value="" disabled>Select a student…</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
          </NativeSelect>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="courseId">For course <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <NativeSelect id="courseId" value={courseId} onChange={e => pickCourse(e.target.value)}>
            <option value="">— Not linked to a course —</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </NativeSelect>
          <p className="text-xs text-muted-foreground">When paid, the student is automatically enrolled in this course.</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Input id="description" value={description} onChange={e => setDescription(e.target.value)} required placeholder="e.g. Monthly fee — March" />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" type="number" min={0.01} step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" value={currency} onChange={e => setCurrency(e.target.value.toUpperCase())} maxLength={3} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Due date</Label>
          <Input id="dueDate" name="dueDate" type="date" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={markPaid} onChange={e => setMarkPaid(e.target.checked)} className="h-4 w-4 accent-brand-600" />
        Payment already received (record as paid)
      </label>
      {markPaid && (
        <div className="space-y-1.5 max-w-sm">
          <Label htmlFor="paymentRef">Receipt / reference no.</Label>
          <Input id="paymentRef" name="paymentRef" placeholder="Bank slip, cash receipt no., …" />
        </div>
      )}
      <Button type="submit" variant="brand" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : 'Create Invoice'}
      </Button>
    </form>
  );
}

export function InvoiceActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(body: Record<string, unknown>, method: 'PATCH' | 'DELETE' = 'PATCH') {
    setBusy(true);
    try {
      await apiFetch(`/api/admin/invoices/${id}`, { method, body: method === 'DELETE' ? undefined : body });
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  function markPaid() {
    const ref = window.prompt('Payment reference / receipt no. (optional):');
    if (ref === null) return;
    act({ action: 'mark-paid', paymentRef: ref });
  }

  if (busy) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  const btn = 'h-8 w-8';
  return (
    <div className="flex gap-1">
      {status !== 'PAID' && (
        <Button size="icon" variant="ghost" className={`${btn} text-emerald-600 hover:bg-emerald-50`} onClick={markPaid} title="Mark paid" aria-label="Mark paid">
          <CheckCircle className="h-4 w-4" />
        </Button>
      )}
      {status === 'PENDING' && (
        <Button size="icon" variant="ghost" className={`${btn} text-amber-600 hover:bg-amber-50`} onClick={() => act({ action: 'mark-overdue' })} title="Mark overdue" aria-label="Mark overdue">
          <Clock className="h-4 w-4" />
        </Button>
      )}
      {(status === 'PENDING' || status === 'OVERDUE') && (
        <Button size="icon" variant="ghost" className={`${btn} text-gray-500 hover:bg-gray-100`}
          onClick={() => confirm('Cancel this invoice?') && act({ action: 'cancel' })} title="Cancel" aria-label="Cancel invoice">
          <XCircle className="h-4 w-4" />
        </Button>
      )}
      {status === 'CANCELLED' && (
        <>
          <Button size="icon" variant="ghost" className={btn} onClick={() => act({ action: 'reopen' })} title="Reopen" aria-label="Reopen invoice">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className={`${btn} text-red-500 hover:bg-red-50`}
            onClick={() => confirm('Delete this invoice permanently?') && act({}, 'DELETE')} title="Delete" aria-label="Delete invoice">
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
