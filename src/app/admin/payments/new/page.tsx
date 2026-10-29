import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewInvoiceForm } from '@/components/admin/invoice-forms';

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ userId?: string }> }) {
  const { userId } = await searchParams;
  const [students, courses] = await Promise.all([
    db.user.findMany({ where: { role: 'STUDENT' }, select: { id: true, name: true, email: true }, orderBy: { name: 'asc' } }).catch(() => []),
    db.course.findMany({ select: { id: true, title: true, price: true, currency: true }, orderBy: { title: 'asc' } }).catch(() => []),
  ]);
  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/payments" className="text-sm text-muted-foreground hover:text-gray-900 flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" />Back to payments
      </Link>
      <Card>
        <CardHeader><CardTitle className="text-xl">Create Invoice</CardTitle></CardHeader>
        <CardContent>
          {students.length === 0
            ? <p className="text-sm text-muted-foreground">No students yet.</p>
            : <NewInvoiceForm students={students} courses={courses} defaultUserId={userId} />}
        </CardContent>
      </Card>
    </div>
  );
}
