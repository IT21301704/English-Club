import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const statusVariant: Record<string, any> = {
  PAID: 'success', PENDING: 'warning', OVERDUE: 'destructive', CANCELLED: 'secondary',
};

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const invoices = await db.invoice.findMany({
    where: { userId },
    orderBy: { issuedAt: 'desc' },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Invoices</h2>
        <p className="text-muted-foreground">Payment history and invoices</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />Invoice History</CardTitle></CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No invoices yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{inv.description}</p>
                    <p className="text-xs text-muted-foreground">Issued: {formatDate(inv.issuedAt)}</p>
                    {inv.dueDate && <p className="text-xs text-muted-foreground">Due: {formatDate(inv.dueDate)}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-brand-700">{formatCurrency(inv.amount, inv.currency)}</span>
                    <Badge variant={statusVariant[inv.status] || 'secondary'}>{inv.status}</Badge>
                    <Link href={`/invoice/${inv.id}`} target="_blank" aria-label="View or download invoice">
                      <Button size="sm" variant="ghost" className="gap-1"><Download className="h-4 w-4" />{inv.status === 'PAID' ? 'Receipt' : 'View'}</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
