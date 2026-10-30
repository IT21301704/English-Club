import Link from 'next/link';
import { LogoFull } from '@/components/ui/logo';
import { Mail, Phone, MapPin, Facebook, Linkedin, Youtube } from 'lucide-react';
import { getSettings } from '@/lib/settings';
import { TEACHER_NAME } from '@/lib/brand';

export async function Footer() {
  const settings = await getSettings();
  const socials = [
    { Icon: Facebook, href: settings.facebookUrl, label: 'Facebook' },
    { Icon: Youtube, href: settings.youtubeUrl, label: 'YouTube' },
    { Icon: Linkedin, href: settings.linkedinUrl, label: 'LinkedIn' },
  ].filter(s => s.href);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block rounded-xl bg-white p-3" aria-label={`${settings.siteName} home`}>
              <span className="block text-center font-display italic font-semibold text-lg leading-none text-gold-700 mb-1">{TEACHER_NAME}&rsquo;s</span>
              <LogoFull className="w-40" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Empowering students with quality education, professional training, and personalized mentorship.
            </p>
            {socials.length > 0 && (
              <div className="flex gap-3">
                {socials.map(({ Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                    className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-600 transition-colors">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[['About Me', '/about'], ['Courses', '/courses'], ['Packages & Fees', '/packages'], ['Testimonials', '/testimonials'], ['Contact', '/contact']].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-white hover:translate-x-1 transition-all inline-block">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Student */}
          <div>
            <h3 className="text-white font-semibold mb-4">Students</h3>
            <ul className="space-y-2 text-sm">
              {[['Student Portal', '/portal'], ['My Courses', '/portal/courses'], ['Session Calendar', '/portal/calendar'], ['My Progress', '/portal/progress'], ['Invoices', '/portal/invoices']].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand-400" /><a href={`mailto:${settings.contactEmail}`} className="hover:text-white">{settings.contactEmail}</a></li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand-400" /><a href={`tel:${settings.contactPhone.replace(/[^\d+]/g, '')}`} className="hover:text-white">{settings.contactPhone}</a></li>
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-brand-400 mt-0.5" /><span>{settings.address}</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
          {/* TODO: add /privacy and /terms pages, then link them here. */}
        </div>
      </div>
    </footer>
  );
}
