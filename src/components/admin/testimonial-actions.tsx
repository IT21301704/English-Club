'use client';
import { Button } from '@/components/ui/button';
import { Check, X, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TestimonialActions({ id, isApproved, isFeatured }: { id: string; isApproved: boolean; isFeatured: boolean }) {
  const router = useRouter();

  async function handleAction(action: 'approve' | 'reject' | 'feature') {
    await fetch(`/api/admin/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    router.refresh();
  }

  return (
    <div className="flex gap-1">
      {!isApproved && (
        <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={() => handleAction('approve')}>
          <Check className="h-4 w-4" />
        </Button>
      )}
      <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-500 hover:bg-amber-50" onClick={() => handleAction('feature')}>
        <Star className={`h-4 w-4 ${isFeatured ? 'fill-amber-400' : ''}`} />
      </Button>
      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleAction('reject')}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
