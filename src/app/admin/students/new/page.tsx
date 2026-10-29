import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewStudentForm } from '@/components/admin/student-forms';

export default async function NewStudentPage() {
  const courses = await db.course.findMany({ select: { id: true, title: true }, orderBy: { title: 'asc' } }).catch(() => []);
  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/students" className="text-sm text-muted-foreground hover:text-gray-900 flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" />Back to students
      </Link>
      <Card>
        <CardHeader><CardTitle className="text-xl">Add Student</CardTitle></CardHeader>
        <CardContent><NewStudentForm courses={courses} /></CardContent>
      </Card>
    </div>
  );
}
