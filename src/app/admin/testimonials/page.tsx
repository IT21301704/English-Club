import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';
import { TestimonialActions } from '@/components/admin/testimonial-actions';

export default async function TestimonialsAdminPage() {
  const testimonials = await db.testimonial.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  const pending = testimonials.filter(t => !t.isApproved).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Testimonials</h2>
        <p className="text-muted-foreground">{pending} pending approval</p>
      </div>

      <div className="space-y-4">
        {testimonials.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">No testimonials yet</CardContent></Card>
        ) : (
          testimonials.map((t) => (
            <Card key={t.id} className={!t.isApproved ? 'border-amber-200 bg-amber-50/30' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                      {getInitials(t.user.name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{t.user.name}</span>
                        {t.course && <Badge variant="secondary" className="text-xs">{t.course}</Badge>}
                        <div className="flex">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <Quote className="h-4 w-4 text-gray-300 mb-1" />
                      <p className="text-sm text-gray-700">{t.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">{formatDate(t.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={t.isApproved ? 'success' : 'warning'}>
                      {t.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                    <TestimonialActions id={t.id} isApproved={t.isApproved} isFeatured={t.isFeatured} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
