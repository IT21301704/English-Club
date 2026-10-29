import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsForm } from '@/components/admin/settings-form';
import { getSettings } from '@/lib/settings';

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-muted-foreground">Site details used on the public site, contact page and invoices.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg">Site Settings</CardTitle></CardHeader>
        <CardContent><SettingsForm settings={settings} /></CardContent>
      </Card>
    </div>
  );
}
