'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { apiFetch } from '@/lib/fetcher';

interface ActionButtonProps extends Omit<ButtonProps, 'onClick'> {
  url: string;
  method?: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Shown in a confirm() dialog before the request is sent. */
  confirmText?: string;
  /** Navigate here on success instead of refreshing the current page. */
  redirectTo?: string;
}

/** Fires a single API call, then refreshes server data. Errors surface via alert(). */
export function ActionButton({ url, method = 'POST', body, confirmText, redirectTo, children, disabled, ...props }: ActionButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();

  async function run() {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    try {
      await apiFetch(url, { method, body });
      startTransition(() => (redirectTo ? router.push(redirectTo) : router.refresh()));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button type="button" onClick={run} disabled={disabled || busy || pending} {...props}>
      {busy || pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : children}
    </Button>
  );
}
