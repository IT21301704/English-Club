'use client';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * datetime-local input that formats its initial value in the *browser's* timezone.
 * The value is filled after mount, because the server (e.g. UTC on Vercel) would render the wrong local time.
 * Submit with `new Date(value).toISOString()` to send an absolute time.
 */
export function DateTimeInput({ value, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'type'> & { value?: string | null }) {
  const [local, setLocal] = useState('');
  useEffect(() => { if (value) setLocal(toLocalInputValue(value)); }, [value]);
  return <Input type="datetime-local" value={local} onChange={e => setLocal(e.target.value)} {...props} />;
}
