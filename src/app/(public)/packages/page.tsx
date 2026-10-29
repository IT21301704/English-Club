import { db } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export const revalidate = 60;

const demoPackages = [
  {
    id: '1', name: 'Starter Pack', description: 'Perfect for beginners exploring a single subject.',
    features: ['1 Course Access', '2 Live Sessions / month', 'Study Notes (PDF)', 'Email Support', 'Progress Tracking'],
    price: 5000, currency: 'LKR', duration: '1 month', isPopular: false,
  },
  {
    id: '2', name: 'Standard Pack', description: 'Our most popular option for dedicated learners.',
    features: ['3 Course Access', '8 Live Sessions / month', 'Study Notes + Recordings', 'Quizzes & Assignments', 'Priority Support', 'Progress Analytics'],
    price: 12000, currency: 'LKR', duration: '3 months', isPopular: true,
  },
  {
    id: '3', name: 'Premium Pack', description: 'Comprehensive training for serious students.',
    features: ['Unlimited Course Access', 'Unlimited Live Sessions', 'All Study Materials', 'Personalized Mentorship', '1-on-1 Coaching', 'Certificate of Completion', 'Career Guidance'],
    price: 25000, currency: 'LKR', duration: '6 months', isPopular: false,
  },
];

export default async function PackagesPage() {
  const packages = await db.trainingPackage.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }).catch(() => []);
  const display = packages.length > 0 ? packages : demoPackages;

  return (
    <div>
      <section className="section-padding bg-gradient-to-br from-brand-50 to-indigo-50">
        <div className="container-custom text-center">
          <Badge variant="brand" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Training Packages &amp; Fees</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Choose the package that best fits your learning goals and budget. All packages include access to the student portal.</p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {display.map((pkg: any) => (
              <Card key={pkg.id} className={`relative flex flex-col card-hover ${pkg.isPopular ? 'border-brand-500 border-2 shadow-xl scale-105' : ''}`}>
                {pkg.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-brand-600 text-white px-4 py-1 gap-1"><Star className="h-3 w-3 fill-current" />Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{pkg.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-brand-700">{formatCurrency(pkg.price, pkg.currency)}</span>
                    <span className="text-gray-500 text-sm ml-1">/ {pkg.duration}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <ul className="space-y-3 mb-6 flex-1">
                    {(pkg.features as string[]).map((f: string) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact">
                    <Button className="w-full" variant={pkg.isPopular ? 'brand' : 'outline'}>Get Started</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ note */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom text-center">
          <p className="text-gray-600 mb-2">Have questions about our packages?</p>
          <Link href="/contact"><Button variant="brand">Contact Us for a Free Consultation</Button></Link>
        </div>
      </section>
    </div>
  );
}
