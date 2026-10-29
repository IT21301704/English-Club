import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin, type RouteContext } from '@/lib/api';
import { markInvoicePaid } from '@/lib/enrollment';

type Ctx = RouteContext<{ id: string }>;

const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('mark-paid'), paymentRef: z.string().trim().optional() }),
  z.object({ action: z.literal('mark-overdue') }),
  z.object({ action: z.literal('cancel') }),
  z.object({ action: z.literal('reopen') }),
]);

export const PATCH = handler<Ctx>(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const body = await parseBody(req, actionSchema);
  if (body.action === 'mark-paid') return NextResponse.json(await markInvoicePaid(id, body.paymentRef || undefined));

  const status = { 'mark-overdue': 'OVERDUE', cancel: 'CANCELLED', reopen: 'PENDING' }[body.action] as 'OVERDUE' | 'CANCELLED' | 'PENDING';
  const invoice = await db.invoice.update({ where: { id }, data: { status, paidAt: null } });
  return NextResponse.json(invoice);
});

export const DELETE = handler<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  await db.invoice.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
