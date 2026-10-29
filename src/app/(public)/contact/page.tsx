import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { ContactForm } from '@/components/public/contact-form';
import { getSettings } from '@/lib/settings';

export const revalidate = 300;

export default async function ContactPage() {
  const settings = await getSettings();
  const channels = [
    { icon: Mail, label: 'Email', value: settings.contactEmail, href: `mailto:${settings.contactEmail}` },
    { icon: Phone, label: 'Phone', value: settings.contactPhone, href: `tel:${settings.contactPhone.replace(/[^\d+]/g, '')}` },
    settings.whatsappNumber && { icon: MessageCircle, label: 'WhatsApp', value: `+${settings.whatsappNumber}`, href: `https://wa.me/${settings.whatsappNumber}` },
    { icon: MapPin, label: 'Location', value: settings.address, href: `https://maps.google.com/?q=${encodeURIComponent(settings.address)}` },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href: string }[];

  return (
    <div>
      <section className="section-padding bg-gradient-to-br from-brand-50 to-indigo-50">
        <div className="container-custom text-center">
          <Badge variant="brand" className="mb-4">Contact</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">Have a question or want to enroll? We&apos;d love to hear from you.</p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <div className="space-y-4">
                  {channels.map(({ icon: Icon, label, value, href }) => (
                    <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl border hover:border-brand-300 hover:bg-brand-50 transition-all group">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                        <Icon className="h-5 w-5 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="font-medium text-gray-900">{value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
              {settings.officeHours && (
                <div className="bg-brand-50 rounded-xl p-6 border border-brand-100">
                  <h3 className="font-semibold text-gray-900 mb-2">Office Hours</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{settings.officeHours}</p>
                </div>
              )}
            </div>

            <Card>
              <CardContent className="p-6"><ContactForm /></CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
