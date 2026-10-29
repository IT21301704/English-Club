import { db } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { CourseGrid } from '@/components/public/course-grid';

export const revalidate = 60;

export default async function CoursesPage() {
  const courses = await db.course.findMany({
    where: { isPublished: true },
    include: { _count: { select: { enrollments: true } } },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  const demoIfEmpty = courses.length === 0 ? [
    { id: '1', title: 'Advanced Mathematics', slug: 'advanced-mathematics', description: 'Master calculus, algebra, and statistics for exams and beyond.', category: 'Mathematics', level: 'Advanced', duration: '3 months', price: 15000, currency: 'LKR', _count: { enrollments: 120 }, thumbnail: null, isPublished: true, isFeatured: true, syllabus: null, createdAt: new Date(), updatedAt: new Date() },
    { id: '2', title: 'Science Foundations', slug: 'science-foundations', description: 'Build a strong science base covering Physics, Chemistry and Biology.', category: 'Science', level: 'Beginner', duration: '2 months', price: 12000, currency: 'LKR', _count: { enrollments: 85 }, thumbnail: null, isPublished: true, isFeatured: false, syllabus: null, createdAt: new Date(), updatedAt: new Date() },
    { id: '3', title: 'English Proficiency', slug: 'english-proficiency', description: 'Improve reading, writing, grammar and spoken English skills.', category: 'Languages', level: 'Intermediate', duration: '2 months', price: 10000, currency: 'LKR', _count: { enrollments: 200 }, thumbnail: null, isPublished: true, isFeatured: false, syllabus: null, createdAt: new Date(), updatedAt: new Date() },
    { id: '4', title: 'ICT & Computer Skills', slug: 'ict-computer-skills', description: 'Practical digital literacy, programming basics, and office productivity.', category: 'Technology', level: 'Beginner', duration: '6 weeks', price: 8000, currency: 'LKR', _count: { enrollments: 65 }, thumbnail: null, isPublished: true, isFeatured: false, syllabus: null, createdAt: new Date(), updatedAt: new Date() },
  ] : courses;

  return (
    <div>
      {/* Header */}
      <section className="section-padding bg-gradient-to-br from-brand-50 to-indigo-50">
        <div className="container-custom text-center">
          <Badge variant="brand" className="mb-4">Courses & Training</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">All Courses &amp; Programmes</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Explore our comprehensive range of courses designed to help you achieve your goals.</p>
        </div>
      </section>

      {/* Course Grid */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <CourseGrid courses={demoIfEmpty.map(c => ({
            id: c.id, title: c.title, slug: c.slug, description: c.description, category: c.category,
            level: c.level, duration: c.duration, price: c.price, currency: c.currency,
            isFeatured: c.isFeatured, enrollments: c._count.enrollments,
          }))} />
        </div>
      </section>
    </div>
  );
}
