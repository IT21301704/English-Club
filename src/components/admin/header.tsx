import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import { AdminMobileNav } from '@/components/admin/sidebar';

export async function AdminHeader() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center">
        <AdminMobileNav />
        <h1 className="font-semibold text-gray-900">Admin Panel</h1>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="brand">Admin</Badge>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-brand-100 text-brand-700 text-xs">{getInitials(user?.name || 'A')}</AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline text-sm font-medium text-gray-700">{user?.name}</span>
      </div>
    </header>
  );
}
