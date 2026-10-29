'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogoMark, LogoWordmark } from '@/components/ui/logo';
import { Menu, X, BookOpen, LogOut, ChevronDown } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Courses', href: '/courses' },
  { label: 'Packages & Fees', href: '/packages' },
  { label: 'Profile', href: '/profile' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Contact', href: '/contact' },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const user = session?.user as any;
  const portalHref = user?.role === 'ADMIN' ? '/admin' : '/portal';

  return (
    <nav className={cn(
      'sticky top-0 z-50 border-b backdrop-blur-md transition-all duration-300',
      scrolled ? 'bg-white/85 shadow-md' : 'bg-white/95 shadow-sm',
    )}>
      <div className="container-custom">
        <div className={cn('flex items-center justify-between transition-all duration-300', scrolled ? 'h-14' : 'h-16')}>
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5" aria-label="English Club home">
            <LogoMark className={cn('ring-0 transition-all duration-300 group-hover:scale-110', scrolled ? 'w-10 h-10' : 'w-12 h-12')} />
            <LogoWordmark className="h-3.5 sm:h-4" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              const active = isActive(pathname, link.href);
              return (
                <Link key={link.href} href={link.href}
                  className={cn(
                    'relative px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    active ? 'text-brand-700' : 'text-gray-600 hover:text-brand-700 hover:bg-brand-50',
                  )}>
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-brand-600"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {session ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger className="flex items-center gap-1.5 rounded-full p-0.5 pr-2 hover:bg-gray-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image} />
                    <AvatarFallback className="bg-brand-100 text-brand-700 text-xs">
                      {getInitials(user?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="end" sideOffset={8}
                    className="z-50 min-w-[200px] rounded-lg border bg-white p-1 shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenu.Separator className="my-1 h-px bg-border" />
                    <DropdownMenu.Item asChild>
                      <Link href={portalHref} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-brand-50 data-[highlighted]:text-brand-700">
                        <BookOpen className="h-4 w-4" />
                        {user?.role === 'ADMIN' ? 'Admin Panel' : 'My Portal'}
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onSelect={() => signOut()}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 cursor-pointer outline-none data-[highlighted]:bg-red-50 data-[highlighted]:text-red-600">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Log In</Button></Link>
                <Link href="/register"><Button variant="brand" size="sm">Get Started</Button></Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-2 rounded-md hover:bg-gray-100" onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={open ? 'x' : 'menu'} className="block"
                initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}>
                {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="lg:hidden overflow-hidden border-t bg-white"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div className="px-4 py-4 space-y-1"
              initial="hidden" animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}>
              {navLinks.map(link => (
                <motion.div key={link.href} variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}>
                  <Link href={link.href}
                    className={cn(
                      'block px-3 py-2 text-sm font-medium rounded-md',
                      isActive(pathname, link.href) ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:text-brand-700 hover:bg-brand-50',
                    )}>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-3 mt-2 border-t flex flex-col gap-2">
                {session ? (
                  <>
                    <Link href={portalHref}>
                      <Button className="w-full" variant="brand" size="sm">Go to Portal</Button>
                    </Link>
                    <Button className="w-full" variant="outline" size="sm" onClick={() => signOut()}>Sign Out</Button>
                  </>
                ) : (
                  <>
                    <Link href="/login"><Button className="w-full" variant="outline" size="sm">Log In</Button></Link>
                    <Link href="/register"><Button className="w-full" variant="brand" size="sm">Get Started</Button></Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page scroll progress */}
      <motion.div className="absolute left-0 right-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-brand-600 to-indigo-400"
        style={{ scaleX: progress }} />
    </nav>
  );
}
