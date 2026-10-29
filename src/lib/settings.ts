import { db } from '@/lib/db';
import type { SettingKey } from '@/lib/validators';

export const DEFAULT_SETTINGS: Record<SettingKey, string> = {
  siteName: 'English Club',
  tagline: 'Learn with confidence',
  contactEmail: 'info@edupro.lk',
  contactPhone: '+94 70 123 4567',
  address: 'Colombo, Sri Lanka',
  officeHours: 'Monday – Friday: 8:00 AM – 6:00 PM\nSaturday: 9:00 AM – 1:00 PM\nSunday: Closed',
  facebookUrl: 'https://www.facebook.com/share/1F7HbFQDRX/',
  youtubeUrl: '',
  linkedinUrl: '',
  whatsappNumber: '',
  paymentInstructions: 'Please transfer the amount to the bank account below and send the receipt to us. Your course will be activated once payment is confirmed.',
};

export async function getSettings(): Promise<Record<SettingKey, string>> {
  const rows = await db.siteSettings.findMany().catch(() => []);
  const stored = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return { ...DEFAULT_SETTINGS, ...stored };
}
