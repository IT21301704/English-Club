import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm, PasswordForm, TestimonialForm } from '@/components/portal/profile-forms';

export default async function ProfilePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/login');

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    include: { enrollments: { include: { course: { select: { title: true } } } } },
  });
  if (!user) redirect('/login');

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        <p className="text-muted-foreground">Manage your details and password</p>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
        <CardContent><ProfileForm user={user} /></CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
          <CardContent><PasswordForm /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Share Your Experience</CardTitle>
            <p className="text-xs text-muted-foreground">Approved testimonials appear on our Success Stories page.</p>
          </CardHeader>
          <CardContent><TestimonialForm courses={user.enrollments.map(e => e.course.title)} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
