import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { PortalMobileNav } from '@/components/portal/sidebar';

export async function PortalHeader() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center">
        <PortalMobileNav />
        <div>
        <h1 className="font-semibold text-gray-900">Student Portal</h1>
        <p className="text-xs text-muted-foreground">Welcome back, {user?.name?.split(' ')[0]}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.image} />
          <AvatarFallback className="bg-brand-100 text-brand-700 text-xs">{getInitials(user?.name || 'S')}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
