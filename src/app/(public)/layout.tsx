import { Navbar } from '@/components/public/navbar';
import { Footer } from '@/components/public/footer';

// Footer reads site settings — refresh static public pages periodically (settings saves also revalidate).
export const revalidate = 300;

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
