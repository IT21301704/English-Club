'use client';
import {
  LayoutDashboard, Users, BookOpen, Video, Calendar,
  CreditCard, Star, Settings, ClipboardList, Mail
} from 'lucide-react';
import { SideNav, MobileNav, type NavItem } from '@/components/layout/side-nav';

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/students', icon: Users },
  { label: 'Courses', href: '/admin/courses', icon: BookOpen },
  { label: 'Content', href: '/admin/content', icon: Video },
  { label: 'Sessions', href: '/admin/sessions', icon: Calendar },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Testimonials', href: '/admin/testimonials', icon: Star },
  { label: 'Packages', href: '/admin/packages', icon: ClipboardList },
  { label: 'Messages', href: '/admin/messages', icon: Mail },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  return <SideNav items={navItems} root="/admin" tag="Admin" theme="dark" />;
}

export function AdminMobileNav() {
  return <MobileNav items={navItems} root="/admin" tag="Admin" theme="dark" />;
}
