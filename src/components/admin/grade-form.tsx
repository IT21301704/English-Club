'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/fetcher';

export function GradeForm({ submissionId, maxMarks, grade, feedback }: {
  submissionId: string; maxMarks: number; grade: number | null; feedback: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError('');
    try {
      await apiFetch(`/api/admin/submissions/${submissionId}`, {
        method: 'PATCH',
        body: { grade: fd.get('grade'), feedback: fd.get('feedback'), status: 'GRADED' },
      });
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center gap-2">
        <Input name="grade" type="number" min={0} max={maxMarks} defaultValue={grade ?? ''} required className="h-9 w-24" aria-label="Grade" />
        <span className="text-sm text-muted-foreground">/ {maxMarks}</span>
      </div>
      <Textarea name="feedback" defaultValue={feedback ?? ''} placeholder="Feedback for the student" className="min-h-[70px]" />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" size="sm" variant="brand" disabled={loading}>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : grade !== null ? 'Update Grade' : 'Save Grade'}
      </Button>
    </form>
  );
}
