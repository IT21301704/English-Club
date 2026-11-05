import { db } from '@/lib/db';
import type { SettingKey } from '@/lib/validators';
import { BRAND_NAME } from '@/lib/brand';

export const DEFAULT_SETTINGS: Record<SettingKey, string> = {
  siteName: BRAND_NAME,
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
  yearsTeaching: '20+',
  studentsTaught: '500+',
  coursesCreated: '20+',
  passRate: '95%',
  aboutIntro: 'With over 20 years of experience in English education and training, I have dedicated my career to helping students unlock their true potential. My teaching approach combines academic rigor with practical application.',
  experienceList: [
    'Senior Lecturer | National Institute of Education | 2018 – Present | Leading curriculum development and delivering lectures at the national level.',
    'Private Tutor & Trainer | English Club | 2014 – Present | Providing personalized one-on-one and group tutoring for A/L and O/L students, as well as professional development courses.',
    'Lecturer | University of Colombo | 2012 – 2018 | Taught undergraduate courses and supervised student research projects.',
  ].join('\n'),
  qualificationsList: [
    'Bachelor of Arts in English | University of Colombo | 2008',
    'Master of Education | University of Peradeniya | 2012',
    'PhD in Educational Psychology | University of Kelaniya | 2018',
  ].join('\n'),
  certificationsList: [
    'Cambridge International Educator Certificate',
    'Google Certified Educator Level 2',
    'Teaching English as a Foreign Language (TEFL)',
  ].join('\n'),
  subjectsList: 'Spoken English\nGrammar & Writing\nEnglish Literature\nO/L English\nA/L English\nIELTS',
};

export async function getSettings(): Promise<Record<SettingKey, string>> {
  const rows = await db.siteSettings.findMany().catch(() => []);
  const stored = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return { ...DEFAULT_SETTINGS, ...stored };
}

/** Non-empty lines of a multi-line setting. */
export function lines(value: string): string[] {
  return value.split('\n').map(l => l.trim()).filter(Boolean);
}

/** Lines split on "|" into trimmed parts, e.g. "Role | Organisation | Period | Description". */
export function rows(value: string): string[][] {
  return lines(value).map(l => l.split('|').map(p => p.trim()));
}

/** "20+" → { value: 20, suffix: '+' } for the animated counters; non-numeric text falls back to 0. */
export function splitStat(value: string): { value: number; prefix: string; suffix: string } {
  const m = value.trim().match(/^(\D*)(\d[\d,]*)(.*)$/);
  if (!m) return { value: 0, prefix: '', suffix: value };
  return { prefix: m[1], value: Number(m[2].replace(/,/g, '')), suffix: m[3] };
}
