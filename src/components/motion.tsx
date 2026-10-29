'use client';
import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
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
