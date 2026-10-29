import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus, Download, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { InvoiceActions } from '@/components/admin/invoice-forms';

const statusVariant: Record<string, any> = {
  PAID: 'success', PENDING: 'warning', OVERDUE: 'destructive', CANCELLED: 'secondary',
};

export default async function PaymentsPage() {
  const [invoices, revenue] = await Promise.all([
    db.invoice.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { issuedAt: 'desc' },
    }).catch(() => []),
    db.invoice.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }).catch(() => ({ _sum: { amount: 0 } })),
  ]);

  const totalRevenue = revenue._sum.amount || 0;
  const pending = invoices.filter(i => i.status === 'PENDING').length;
  const overdue = invoices.filter(i => i.status === 'OVERDUE').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments &amp; Invoices</h2>
        </div>
        <Link href="/admin/payments/new">
          <Button variant="brand" className="gap-2"><Plus className="h-4 w-4" />Create Invoice</Button>
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Pending Invoices', value: pending, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Overdue', value: overdue, icon: CreditCard, color: 'text-red-600', bg: 'bg-red-100' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <div className="text-xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invoice Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  {['Student', 'Description', 'Amount', 'Status', 'Issued', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">No invoices yet</td></tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{inv.user.name}</p>
                        <p className="text-xs text-muted-foreground">{inv.user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-[240px]">
                        <p className="truncate">{inv.description}</p>
                        {inv.paymentRef && <p className="text-xs text-muted-foreground truncate">Ref: {inv.paymentRef}</p>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-brand-700">{formatCurrency(inv.amount, inv.currency)}</td>
                      <td className="px-4 py-3"><Badge variant={statusVariant[inv.status]}>{inv.status}</Badge></td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(inv.issuedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/invoice/${inv.id}`} target="_blank" title="View / print" aria-label="View or print invoice">
                            <Button size="icon" variant="ghost" className="h-8 w-8"><Download className="h-3.5 w-3.5" /></Button>
                          </Link>
                          <InvoiceActions id={inv.id} status={inv.status} />
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
