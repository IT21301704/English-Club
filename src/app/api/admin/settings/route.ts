import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin } from '@/lib/api';
import { settingsSchema } from '@/lib/validators';

export const PUT = handler(async (req) => {
  await requireAdmin();
  const settings = await parseBody(req, settingsSchema);
  const entries = Object.entries(settings).filter(([, v]) => v !== undefined) as [string, string][];
  await db.$transaction(entries.map(([key, value]) => db.siteSettings.upsert({
    where: { key }, update: { value }, create: { key, value },
  })));
  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
});
