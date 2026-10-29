import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Plus, Mail, Search } from 'lucide-react';
import Link from 'next/link';
import { formatDate, getInitials } from '@/lib/utils';

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.trim() ?? '';
  const students = await db.user.findMany({
    where: {
      role: 'STUDENT',
      ...(q ? { OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { email: { contains: q, mode: 'insensitive' as const } },
        { phone: { contains: q } },
      ] } : {}),
    },
    include: { _count: { select: { enrollments: true } } },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Students</h2>
          <p className="text-muted-foreground">{students.length} {q ? `matching "${q}"` : 'registered students'}</p>
        </div>
        <Link href="/admin/students/new">
          <Button variant="brand" className="gap-2"><Plus className="h-4 w-4" />Add Student</Button>
        </Link>
      </div>

      <form className="flex gap-2 max-w-md">
        <Input name="q" defaultValue={q} placeholder="Search by name, email or phone" />
        <Button type="submit" variant="outline" className="gap-2"><Search className="h-4 w-4" />Search</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  {['Student', 'Email', 'Courses', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">No students yet</td></tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-brand-100 text-brand-700">{getInitials(student.name)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-gray-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{student.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{student._count.enrollments} courses</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(student.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={student.isActive ? 'success' : 'destructive'}>
                          {student.isActive ? 'Active' : 'Suspended'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link href={`/admin/students/${student.id}`}>
                            <Button size="sm" variant="outline">View</Button>
                          </Link>
                          <a href={`mailto:${student.email}`}>
                            <Button size="icon" variant="ghost" className="h-8 w-8"><Mail className="h-3.5 w-3.5" /></Button>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
