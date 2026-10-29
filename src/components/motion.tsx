'use client';
import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform, type HTMLMotionProps } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';

const ease = [0.22, 1, 0.36, 1] as const;

/** Fades + slides children in the first time they scroll into view. */
export function Reveal({
  delay = 0, y = 24, className, children, ...props
}: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Container that reveals its <StaggerItem> children one after another. */
export function Stagger({
  className, children, gap = 0.08, ...props
}: HTMLMotionProps<'div'> & { gap?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ className, children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Card wrapper that lifts on hover and presses down on tap. */
export function HoverLift({ className, children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('h-full', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Unveils its content with a wipe from `from` while the content settles from a slight zoom. */
export function ImageReveal({
  className, children, delay = 0, from = 'left',
}: { className?: string; children: React.ReactNode; delay?: number; from?: 'left' | 'bottom' }) {
  const hidden = from === 'left' ? 'inset(0 100% 0 0)' : 'inset(100% 0 0 0)';
  return (
    <motion.div
      className={cn('overflow-hidden', className)}
      initial={{ clipPath: hidden }}
      whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1.1, ease, delay }}
    >
      <motion.div
        className="relative h-full w-full"
        initial={{ scale: 1.2 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.6, ease, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Moves its content against the scroll direction for a depth effect. `offset` is in pixels. */
export function Parallax({ className, children, offset = 60 }: { className?: string; children: React.ReactNode; offset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-offset, offset]);
  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      {/* Oversized by `offset` on each side so the edges never show while moving. */}
      <motion.div style={{ y, top: -offset, bottom: -offset }} className="absolute inset-x-0">
        {children}
      </motion.div>
    </div>
  );
}

/** Gently bobs up and down; used for floating badges over images. */
export function Float({ className, children, delay = 0 }: { className?: string; children: React.ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      animate={reduce ? undefined : { y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 0.5, delay }, scale: { duration: 0.5, delay, ease },
        y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Counts from 0 up to `value` when scrolled into view. */
export function CountUp({
  value, prefix = '', suffix = '', format, duration = 1.4, className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  format?: 'currency';
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) { setDisplay(value); return; }
    const controls = animate(0, value, { duration, ease, onUpdate: v => setDisplay(v) });
    return () => controls.stop();
  }, [inView, value, duration, reduce]);

  const text = format === 'currency'
    ? formatCurrency(Math.round(display))
    : Math.round(display).toLocaleString();

  return <span ref={ref} className={cn('tabular-nums', className)}>{prefix}{text}{suffix}</span>;
}
