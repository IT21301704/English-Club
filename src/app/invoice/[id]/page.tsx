import { notFound, redirect } from 'next/navigation';
import { LogoMark } from '@/components/ui/logo';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/api';
import { getSettings } from '@/lib/settings';
import { PrintButton } from '@/components/print-button';
import { formatCurrency, formatDate } from '@/lib/utils';

export const metadata = { title: 'Invoice' };

/** Printable invoice — students see their own, admins see any. "Save as PDF" from the print dialog gives the download. */
export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const { id } = await params;

  const invoice = await db.invoice.findUnique({ where: { id }, include: { user: true, course: { select: { title: true } } } });
  if (!invoice || (user.role !== 'ADMIN' && invoice.userId !== user.id)) notFound();
  const settings = await getSettings();
  const number = `INV-${invoice.issuedAt.getFullYear()}-${invoice.id.slice(-6).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white py-10 print:py-0 px-4">
      <div className="max-w-3xl mx-auto mb-4 flex justify-end print:hidden"><PrintButton /></div>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow print:shadow-none p-10">
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center gap-3">
            <LogoMark className="w-12 h-12" />
            <div>
              <p className="font-bold text-lg text-gray-900">{settings.siteName}</p>
              <p className="text-xs text-gray-500">{settings.address}</p>
              <p className="text-xs text-gray-500">{settings.contactEmail} · {settings.contactPhone}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-gray-900">INVOICE</p>
            <p className="text-sm text-gray-500">{number}</p>
            <p className={`mt-2 inline-block text-xs font-bold px-2 py-1 rounded ${invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : invoice.status === 'CANCELLED' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
              {invoice.status}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div>
            <p className="text-xs uppercase text-gray-400 font-semibold mb-1">Billed to</p>
            <p className="font-medium text-gray-900">{invoice.user.name}</p>
            <p className="text-gray-600">{invoice.user.email}</p>
            {invoice.user.phone && <p className="text-gray-600">{invoice.user.phone}</p>}
          </div>
          <div className="text-right space-y-1">
            <p><span className="text-gray-400">Issued:</span> {formatDate(invoice.issuedAt)}</p>
            {invoice.dueDate && <p><span className="text-gray-400">Due:</span> {formatDate(invoice.dueDate)}</p>}
            {invoice.paidAt && <p><span className="text-gray-400">Paid:</span> {formatDate(invoice.paidAt)}</p>}
            {invoice.paymentRef && <p><span className="text-gray-400">Ref:</span> {invoice.paymentRef}</p>}
          </div>
        </div>

        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 font-semibold text-gray-600">Description</th>
              <th className="text-right py-2 font-semibold text-gray-600">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3">{invoice.description}{invoice.course && <span className="block text-xs text-gray-500">Course: {invoice.course.title}</span>}</td>
              <td className="py-3 text-right">{formatCurrency(invoice.amount, invoice.currency)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-4 text-right font-semibold">Total</td>
              <td className="pt-4 text-right text-lg font-bold text-brand-700">{formatCurrency(invoice.amount, invoice.currency)}</td>
            </tr>
          </tfoot>
        </table>

        {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && settings.paymentInstructions && (
          <div className="rounded-md bg-gray-50 border p-4 text-sm text-gray-700 whitespace-pre-line">
            <p className="font-semibold mb-1">How to pay</p>
            {settings.paymentInstructions}
          </div>
        )}
        <p className="text-center text-xs text-gray-400 mt-10">Thank you for learning with {settings.siteName}.</p>
      </div>
    </div>
  );
}
