'use client';
import { LayoutDashboard, BookOpen, Calendar, TrendingUp, FileText, User, ClipboardList } from 'lucide-react';
import { SideNav, MobileNav, type NavItem } from '@/components/layout/side-nav';

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/portal', icon: LayoutDashboard },
  { label: 'My Courses', href: '/portal/courses', icon: BookOpen },
  { label: 'Assignments', href: '/portal/assignments', icon: ClipboardList },
  { label: 'Calendar', href: '/portal/calendar', icon: Calendar },
  { label: 'Progress', href: '/portal/progress', icon: TrendingUp },
  { label: 'Invoices', href: '/portal/invoices', icon: FileText },
  { label: 'Profile', href: '/portal/profile', icon: User },
];

export function PortalSidebar() {
  return <SideNav items={navItems} root="/portal" tag="Portal" theme="light" />;
}

export function PortalMobileNav() {
  return <MobileNav items={navItems} root="/portal" tag="Portal" theme="light" />;
}
