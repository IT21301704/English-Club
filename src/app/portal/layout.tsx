import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PortalSidebar } from '@/components/portal/sidebar';
import { PortalHeader } from '@/components/portal/header';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="flex h-screen bg-gray-50">
      <PortalSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <PortalHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
