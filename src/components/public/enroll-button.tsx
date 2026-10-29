'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/fetcher';

type Status = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | null;

export function EnrollButton({ courseId, slug, isLoggedIn, isFree, status }: {
  courseId: string; slug: string; isLoggedIn: boolean; isFree: boolean; status: Status;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (status === 'ACTIVE' || status === 'COMPLETED') {
    return (
      <Button variant="brand" size="lg" className="w-full gap-2" onClick={() => router.push(`/portal/courses/${courseId}`)}>
        Go to course <ArrowRight className="h-4 w-4" />
      </Button>
    );
  }
  if (status === 'SUSPENDED') {
    return <p className="text-sm text-center text-muted-foreground">Your access to this course is suspended. Please contact your trainer.</p>;
  }
  if (status === 'PENDING') {
    return (
      <Button variant="outline" size="lg" className="w-full" onClick={() => router.push(`/portal/courses/${courseId}`)}>
        Awaiting payment — view details
      </Button>
    );
  }

  async function enroll() {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/courses/${slug}`)}`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { invoice } = await apiFetch<{ invoice: { id: string } | null }>('/api/enrollments', { body: { courseId } });
      router.push(invoice ? `/invoice/${invoice.id}` : `/portal/courses/${courseId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button variant="brand" size="lg" className="w-full" onClick={enroll} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : !isLoggedIn ? 'Sign in to enroll' : isFree ? 'Enroll for free' : 'Enroll now'}
      </Button>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
      {!isFree && isLoggedIn && <p className="text-xs text-muted-foreground text-center">An invoice will be issued — access opens once payment is confirmed.</p>}
    </div>
  );
}
