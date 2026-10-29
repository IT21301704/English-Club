import { Mail, Trash2, Check } from 'lucide-react';
import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/components/admin/action-button';
import { formatDateTime } from '@/lib/utils';

export default async function MessagesPage() {
  const messages = await db.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }).catch(() => []);
  const unread = messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        <p className="text-muted-foreground">Contact form enquiries · {unread} unread</p>
      </div>
      {messages.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No messages yet.</CardContent></Card>
      ) : messages.map(m => (
        <Card key={m.id} className={m.isRead ? 'opacity-75' : 'border-brand-200'}>
          <CardContent className="p-5 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{m.subject}</h3>
                  {!m.isRead && <Badge variant="brand">New</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{m.name} · {m.email} · {formatDateTime(m.createdAt)}</p>
              </div>
              <div className="flex gap-1">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + m.subject)}`}>
                  <Button size="sm" variant="outline" className="gap-1"><Mail className="h-3.5 w-3.5" />Reply</Button>
                </a>
                <ActionButton url={`/api/admin/messages/${m.id}`} method="PATCH" body={{ isRead: !m.isRead }} size="sm" variant="ghost" className="gap-1">
                  <Check className="h-3.5 w-3.5" />{m.isRead ? 'Mark unread' : 'Mark read'}
                </ActionButton>
                <ActionButton url={`/api/admin/messages/${m.id}`} method="DELETE" confirmText="Delete this message?"
                  size="icon" variant="ghost" className="h-9 w-9 text-red-500 hover:bg-red-50" aria-label="Delete message">
                  <Trash2 className="h-3.5 w-3.5" />
                </ActionButton>
              </div>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{m.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
