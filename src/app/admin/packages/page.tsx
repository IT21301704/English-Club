import { Trash2, CheckCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionButton } from '@/components/admin/action-button';
import { PackageForm, EditablePackage } from '@/components/admin/package-form';
import { formatCurrency } from '@/lib/utils';

export default async function AdminPackagesPage() {
  const packages = await db.trainingPackage.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }).catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Training Packages</h2>
        <p className="text-muted-foreground">Shown on the public Packages &amp; Fees page.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="grid md:grid-cols-2 gap-4">
          {packages.length === 0 && (
            <Card className="md:col-span-2"><CardContent className="py-12 text-center text-sm text-muted-foreground">
              No packages yet — the public page shows demo packages until you add one.
            </CardContent></Card>
          )}
          {packages.map(pkg => (
            <Card key={pkg.id} className={pkg.isActive ? '' : 'opacity-60'}>
              <CardContent className="p-5">
                <EditablePackage pkg={pkg}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                      <p className="text-xs text-muted-foreground">{pkg.description}</p>
                    </div>
                    <ActionButton url={`/api/admin/packages/${pkg.id}`} method="DELETE" confirmText={`Delete package "${pkg.name}"?`}
                      size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50 flex-shrink-0" aria-label="Delete package">
                      <Trash2 className="h-3.5 w-3.5" />
                    </ActionButton>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {!pkg.isActive && <Badge variant="secondary">Hidden</Badge>}
                    {pkg.isPopular && <Badge variant="brand">Most popular</Badge>}
                    <Badge variant="outline">#{pkg.order}</Badge>
                  </div>
                  <p className="text-xl font-bold text-brand-700 mb-2">{formatCurrency(pkg.price, pkg.currency)} <span className="text-xs text-muted-foreground font-normal">/ {pkg.duration}</span></p>
                  <ul className="space-y-1">
                    {pkg.features.map(f => <li key={f} className="text-xs flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-emerald-500" />{f}</li>)}
                  </ul>
                </EditablePackage>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Add Package</CardTitle></CardHeader>
          <CardContent><PackageForm /></CardContent>
        </Card>
      </div>
    </div>
  );
}
