import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseForm } from '@/components/admin/course-form';

export default function NewCoursePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/admin/courses" className="text-sm text-muted-foreground hover:text-gray-900 flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" />Back to courses
      </Link>
      <Card>
        <CardHeader><CardTitle className="text-xl">Create Course</CardTitle></CardHeader>
        <CardContent><CourseForm /></CardContent>
      </Card>
    </div>
  );
}
