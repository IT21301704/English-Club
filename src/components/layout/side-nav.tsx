'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Menu, X, type LucideIcon } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { LogoMark } from '@/components/ui/logo';
import { TEACHER_NAME } from '@/lib/brand';
import { cn } from '@/lib/utils';

export type NavItem = { label: string; href: string; icon: LucideIcon };

type Theme = 'light' | 'dark';

const themes = {
  light: {
    aside: 'bg-white border-r',
    brandBar: 'border-b',
    brandName: 'text-brand-700',
    brandTag: 'text-muted-foreground',
    pill: 'bg-brand-100',
    active: 'text-brand-700',
    idle: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    iconIdle: 'text-gray-400 group-hover:text-gray-600',
    footer: 'border-t',
    signOut: 'text-gray-600 hover:bg-red-50 hover:text-red-600',
  },
  dark: {
    aside: 'bg-gray-900 text-gray-100',
    brandBar: 'border-b border-gray-800',
    brandName: 'text-white',
    brandTag: 'text-gray-400',
    pill: 'bg-brand-600',
    active: 'text-white',
    idle: 'text-gray-400 hover:bg-gray-800 hover:text-white',
    iconIdle: '',
    footer: 'border-t border-gray-800',
    signOut: 'text-gray-400 hover:bg-red-900/30 hover:text-red-400',
  },
} satisfies Record<Theme, Record<string, string>>;

function NavContent({
  items, root, tag, theme, layoutId, onNavigate,
}: { items: NavItem[]; root: string; tag: string; theme: Theme; layoutId: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = themes[theme];

  return (
    <>
      <div className={cn('flex items-center gap-2 h-16 px-6 shrink-0', t.brandBar)}>
        <motion.div whileHover={{ scale: 1.08 }}>
          <LogoMark />
        </motion.div>
        <span className="flex flex-col leading-tight min-w-0">
          <span className="font-display italic text-xs text-gold-500 truncate">{TEACHER_NAME}&rsquo;s</span>
          <span className={cn('font-bold', t.brandName)}>English Club <span className={cn('text-xs font-normal ml-1', t.brandTag)}>{tag}</span></span>
        </span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== root && pathname.startsWith(href));
          return (
            <Link key={href} href={href} onClick={onNavigate}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active ? t.active : t.idle,
              )}>
              {/* Shared layoutId makes the highlight glide between items on navigation. */}
              {active && (
                <motion.span
                  layoutId={layoutId}
                  className={cn('absolute inset-0 rounded-lg', t.pill)}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className={cn('relative h-4 w-4 transition-transform group-hover:scale-110', !active && t.iconIdle)} />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className={cn('p-3', t.footer)}>
        <button onClick={() => signOut({ callbackUrl: '/' })}
          className={cn('flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors', t.signOut)}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );
}

type SideNavProps = { items: NavItem[]; root: string; tag: string; theme: Theme };

export function SideNav(props: SideNavProps) {
  return (
    <aside className={cn('hidden md:flex flex-col w-64', themes[props.theme].aside)}>
      <NavContent {...props} layoutId={`sidenav-${props.tag}`} />
    </aside>
  );
}

/** Hamburger + slide-in drawer, shown below the md breakpoint where the sidebar is hidden. */
export function MobileNav(props: SideNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="md:hidden -ml-2 mr-2 p-2 rounded-md hover:bg-gray-100" aria-label="Open navigation">
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </Dialog.Trigger>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.aside
                className={cn('fixed inset-y-0 left-0 z-50 flex flex-col w-72 max-w-[85vw] shadow-2xl md:hidden', themes[props.theme].aside)}
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              >
                <Dialog.Title className="sr-only">Navigation</Dialog.Title>
                <Dialog.Close className="absolute right-3 top-4 p-1.5 rounded-md opacity-70 hover:opacity-100" aria-label="Close navigation">
                  <X className="h-5 w-5" />
                </Dialog.Close>
                <NavContent {...props} layoutId={`mobilenav-${props.tag}`} onNavigate={() => setOpen(false)} />
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
