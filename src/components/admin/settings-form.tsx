'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/fetcher';
import type { SettingKey } from '@/lib/validators';

const GROUPS: { title: string; fields: { key: SettingKey; label: string; multiline?: boolean; placeholder?: string }[] }[] = [
  { title: 'General', fields: [
    { key: 'siteName', label: 'Site name' },
    { key: 'tagline', label: 'Tagline' },
  ] },
  { title: 'Contact details', fields: [
    { key: 'contactEmail', label: 'Contact email' },
    { key: 'contactPhone', label: 'Phone' },
    { key: 'whatsappNumber', label: 'WhatsApp number', placeholder: '94701234567 (digits only, with country code)' },
    { key: 'address', label: 'Address / location' },
    { key: 'officeHours', label: 'Office hours', multiline: true },
  ] },
  { title: 'Social links', fields: [
    { key: 'facebookUrl', label: 'Facebook URL' },
    { key: 'youtubeUrl', label: 'YouTube URL' },
    { key: 'linkedinUrl', label: 'LinkedIn URL' },
  ] },
  { title: 'Payments', fields: [
    { key: 'paymentInstructions', label: 'Payment instructions (shown on unpaid invoices — bank details etc.)', multiline: true },
  ] },
];

export function SettingsForm({ settings }: { settings: Record<SettingKey, string> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    setLoading(true);
    setMsg(null);
    try {
      await apiFetch('/api/admin/settings', { method: 'PUT', body });
      setMsg({ ok: true, text: 'Settings saved.' });
      router.refresh();
    } catch (err: any) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {GROUPS.map(group => (
        <section key={group.title} className="space-y-3">
          <h3 className="font-semibold text-gray-900 border-b pb-2">{group.title}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {group.fields.map(f => (
              <div key={f.key} className={`space-y-1.5 ${f.multiline ? 'md:col-span-2' : ''}`}>
                <Label htmlFor={f.key}>{f.label}</Label>
                {f.multiline
                  ? <Textarea id={f.key} name={f.key} defaultValue={settings[f.key]} />
                  : <Input id={f.key} name={f.key} defaultValue={settings[f.key]} placeholder={f.placeholder} />}
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="flex items-center gap-3">
        <Button type="submit" variant="brand" disabled={loading}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : 'Save Settings'}
        </Button>
        {msg && <span className={`text-sm ${msg.ok ? 'text-emerald-600' : 'text-destructive'}`}>{msg.text}</span>}
      </div>
    </form>
  );
}
