import { db } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export const revalidate = 60;

const demoTestimonials = [
  { id: '1', content: 'The course structure was incredible. I went from struggling with mathematics to scoring top marks in my A/L exams. The personalized attention made all the difference.', rating: 5, user: { name: 'Priya Perera', avatar: null }, course: 'Advanced Mathematics', createdAt: new Date() },
  { id: '2', content: 'I enrolled in the English Proficiency course and within two months, I gained the confidence to present at my workplace. Highly recommend!', rating: 5, user: { name: 'Kasun Fernando', avatar: null }, course: 'English Proficiency', createdAt: new Date() },
  { id: '3', content: 'The online portal is so easy to use. I can revisit lectures anytime, track my progress, and the quiz system keeps me engaged. Best investment I made.', rating: 5, user: { name: 'Dilani Silva', avatar: null }, course: 'Science Foundations', createdAt: new Date() },
  { id: '4', content: 'What sets this apart is the genuine care for students. I always felt supported, never left behind. My son improved dramatically in just 6 weeks.', rating: 5, user: { name: 'Malini Jayawardena', avatar: null }, course: 'Advanced Mathematics', createdAt: new Date() },
  { id: '5', content: 'The ICT course was practical and relevant. I now have real skills I use every day. The assignments pushed me in the best way possible.', rating: 4, user: { name: 'Roshan Kumara', avatar: null }, course: 'ICT & Computer Skills', createdAt: new Date() },
  { id: '6', content: 'Excellent teaching style — complex topics are broken down simply. The recorded sessions are a lifesaver when I need to revise before exams.', rating: 5, user: { name: 'Nadia Hassan', avatar: null }, course: 'English Proficiency', createdAt: new Date() },
];

export default async function TestimonialsPage() {
  const dbTestimonials = await db.testimonial.findMany({
    where: { isApproved: true },
    include: { user: { select: { name: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  const testimonials = dbTestimonials.length > 0 ? dbTestimonials : demoTestimonials;

  return (
    <div>
      <section className="section-padding bg-gradient-to-br from-brand-50 to-indigo-50">
        <div className="container-custom text-center">
          <Badge variant="brand" className="mb-4">Testimonials</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Student Success Stories</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Real results from real students. See how English Club has transformed learning journeys.</p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t: any) => (
              <Card key={t.id} className="card-hover relative">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-brand-200 mb-3" />
                  <p className="text-gray-700 leading-relaxed mb-6 text-sm">{t.content}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                      {getInitials(t.user.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.user.name}</p>
                      {t.course && <p className="text-xs text-gray-500">{t.course}</p>}
                    </div>
                    <div className="ml-auto flex">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
