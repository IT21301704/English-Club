import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Users, BookOpen, CreditCard, Calendar, TrendingUp, UserPlus, Star, ClipboardCheck, Mail } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Stagger, StaggerItem, HoverLift, CountUp } from '@/components/motion';
import { Badge } from '@/components/ui/badge';

export default async function AdminDashboard() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [studentCount, newStudents, courseCount, publishedCount, sessions, enrollments, revenue, pendingTestimonials, toGrade, unreadMessages] = await Promise.all([
    db.user.count({ where: { role: 'STUDENT' } }).catch(() => 0),
    db.user.count({ where: { role: 'STUDENT', createdAt: { gte: monthStart } } }).catch(() => 0),
    db.course.count().catch(() => 0),
    db.course.count({ where: { isPublished: true } }).catch(() => 0),
    db.session.count({ where: { scheduledAt: { gte: new Date() } } }).catch(() => 0),
    db.enrollment.findMany({
      include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } },
      orderBy: { enrolledAt: 'desc' },
      take: 5,
    }).catch(() => []),
    db.invoice.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }).catch(() => ({ _sum: { amount: 0 } })),
    db.testimonial.count({ where: { isApproved: false } }).catch(() => 0),
    db.submission.count({ where: { status: 'SUBMITTED' } }).catch(() => 0),
    db.contactMessage.count({ where: { isRead: false } }).catch(() => 0),
  ]);

  const totalRevenue = revenue._sum.amount || 0;

  const stats = [
    { label: 'Total Students', value: studentCount, icon: Users, color: 'text-brand-600', bg: 'bg-brand-100', change: `+${newStudents} this month` },
    { label: 'Courses', value: courseCount, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100', change: `${publishedCount} published` },
    { label: 'Total Revenue', value: totalRevenue, format: 'currency' as const, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-100', change: 'All time' },
    { label: 'Upcoming Sessions', value: sessions, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-100', change: 'Scheduled' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-muted-foreground">Overview of your learning platform</p>
      </div>

      {/* Stats */}
      <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, format, icon: Icon, color, bg, change }) => (
          <StaggerItem key={label}>
            <HoverLift>
              <Card className="group h-full transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900"><CountUp value={value} format={format} /></div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                  <div className="text-xs text-emerald-600 mt-1">{change}</div>
                </CardContent>
              </Card>
            </HoverLift>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" />Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No enrollments yet</p>
            ) : (
              <div className="space-y-3">
                {enrollments.map((e) => (
                  <div key={e.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{e.user.name}</p>
                      <p className="text-xs text-muted-foreground">{e.course.title}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={e.status === 'PENDING' ? 'warning' : e.status === 'SUSPENDED' ? 'destructive' : 'success'}>
                        {e.status === 'PENDING' ? 'Awaiting payment' : e.status.charAt(0) + e.status.slice(1).toLowerCase()}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(e.enrolledAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Student', href: '/admin/students/new', icon: Users, color: 'brand' },
                { label: 'Create Course', href: '/admin/courses/new', icon: BookOpen, color: 'emerald' },
                { label: 'Schedule Session', href: '/admin/sessions/new', icon: Calendar, color: 'purple' },
                { label: 'Review Testimonials', href: '/admin/testimonials', icon: Star, color: 'amber', badge: pendingTestimonials },
                { label: 'Grade Submissions', href: '/admin/content?tab=submissions', icon: ClipboardCheck, color: 'brand', badge: toGrade },
                { label: 'Messages', href: '/admin/messages', icon: Mail, color: 'brand', badge: unreadMessages },
              ].map(({ label, href, icon: Icon, badge }) => (
                <Link key={label} href={href}
                  className="group flex flex-col items-center justify-center p-4 rounded-xl border hover:border-brand-300 hover:bg-brand-50 hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98] transition-all gap-2 text-center">
                  <Icon className="h-6 w-6 text-brand-600 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                  {badge ? <Badge variant="destructive" className="text-xs">{badge} pending</Badge> : null}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
