'use client';
import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/fetcher';

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError('');
    try {
      await apiFetch('/api/contact', {
        body: {
          name: `${fd.get('firstName')} ${fd.get('lastName')}`.trim(),
          email: fd.get('email'), subject: fd.get('subject'), message: fd.get('message'),
        },
      });
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
        <p className="text-gray-600">We&apos;ll get back to you within 24 hours.</p>
        <Button className="mt-6" variant="outline" onClick={() => setSent(false)}>Send Another</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Send a Message</h2>
      {error && <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label htmlFor="firstName">First Name</Label><Input id="firstName" name="firstName" placeholder="John" required /></div>
        <div className="space-y-1.5"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" name="lastName" placeholder="Doe" /></div>
      </div>
      <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="john@example.com" required /></div>
      <div className="space-y-1.5"><Label htmlFor="subject">Subject</Label><Input id="subject" name="subject" placeholder="Course enquiry / Enrollment" required minLength={2} /></div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" className="min-h-[120px] resize-none" placeholder="Tell us how we can help you..." required minLength={10} />
      </div>
      <Button type="submit" variant="brand" className="w-full gap-2" disabled={loading}>
        {loading ? 'Sending...' : <><Send className="h-4 w-4" />Send Message</>}
      </Button>
    </form>
  );
}
