'use client';
import { useState } from 'react';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { LogoFull } from '@/components/ui/logo';

export default function LoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const result = await signIn('credentials', { email, password, redirect: false });

    if (result?.error) {
      setError(result.error === 'Account suspended'
        ? 'Your account is suspended. Please contact your trainer.'
        : 'Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      // Honour ?callbackUrl= (same-site paths only), otherwise route by role.
      const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl');
      let target = callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//') ? callbackUrl : null;
      if (!target) {
        const session = await getSession();
        target = (session?.user as any)?.role === 'ADMIN' ? '/admin' : '/portal';
      }
      router.push(target);
      router.refresh();
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-3">
          <Link href="/" aria-label="English Club home"><LogoFull className="w-44" /></Link>
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <p className="text-sm text-muted-foreground">Sign in to your English Club account</p>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2">{error}</div>}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/contact" className="text-xs text-brand-600 hover:underline" title="Your trainer can reset your password">Forgot password?</Link>
            </div>
            <div className="relative">
              <Input id="password" name="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" variant="brand" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in...</> : 'Sign In'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-brand-600 font-medium hover:underline">Sign up</Link>
        </p>
      </CardContent>
    </Card>
  );
}
