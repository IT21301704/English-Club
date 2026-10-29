import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin } from '@/lib/api';
import { invoiceSchema } from '@/lib/validators';
import { markInvoicePaid } from '@/lib/enrollment';

export const POST = handler(async (req) => {
  await requireAdmin();
  const { markPaid, paymentRef, ...data } = await parseBody(req, invoiceSchema);
  let invoice = await db.invoice.create({ data });
  if (markPaid) invoice = await markInvoicePaid(invoice.id, paymentRef ?? undefined);
  return NextResponse.json(invoice, { status: 201 });
});
