import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Users, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default async function AdminCoursesPage() {
  const courses = await db.course.findMany({
    include: { _count: { select: { enrollments: true, modules: true } } },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Courses</h2>
          <p className="text-muted-foreground">{courses.length} total courses</p>
        </div>
        <Link href="/admin/courses/new">
          <Button variant="brand" className="gap-2"><Plus className="h-4 w-4" />Create Course</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.length === 0 ? (
          <Card className="col-span-3">
            <CardContent className="py-16 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No courses yet. Create your first course.</p>
              <Link href="/admin/courses/new"><Button variant="brand" className="mt-4">Create Course</Button></Link>
            </CardContent>
          </Card>
        ) : (
          courses.map(course => (
            <Card key={course.id} className="overflow-hidden card-hover">
              <div className="h-32 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 flex items-center justify-center relative">
                <BookOpen className="h-12 w-12 text-white/40" />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge variant={course.isPublished ? 'success' : 'secondary'} className="text-xs">
                    {course.isPublished ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                    {course.isPublished ? 'Live' : 'Draft'}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <Badge variant="brand" className="mb-2">{course.category}</Badge>
                <h3 className="font-bold text-gray-900 mb-1">{course.title}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course._count.enrollments} enrolled</span>
                  <span>{course._count.modules} modules</span>
                  <span>{formatCurrency(course.price, course.currency)}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/courses/${course.id}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full">Manage</Button>
                  </Link>
                  <Link href={`/courses/${course.slug}`} target="_blank">
                    <Button size="sm" variant="ghost"><Eye className="h-3.5 w-3.5" /></Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
