import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: { default: 'English Club', template: '%s | English Club' },
  description: 'Professional Learning Management System — Online Courses, Training & Mentorship',
  keywords: ['LMS', 'online courses', 'training', 'e-learning', 'education'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'English Club',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
