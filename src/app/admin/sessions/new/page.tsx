import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SessionForm } from '@/components/admin/session-forms';

export default async function NewSessionPage() {
  const courses = await db.course.findMany({ select: { id: true, title: true }, orderBy: { title: 'asc' } }).catch(() => []);
  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/sessions" className="text-sm text-muted-foreground hover:text-gray-900 flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" />Back to sessions
      </Link>
      <Card>
        <CardHeader><CardTitle className="text-xl">Schedule Session</CardTitle></CardHeader>
        <CardContent>
          {courses.length === 0
            ? <p className="text-sm text-muted-foreground">Create a course first — sessions belong to a course.</p>
            : <SessionForm courses={courses} />}
        </CardContent>
      </Card>
    </div>
  );
}
