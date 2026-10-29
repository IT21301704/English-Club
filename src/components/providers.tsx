'use client';
import { SessionProvider } from 'next-auth/react';
import { MotionConfig } from 'framer-motion';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Honour the OS "reduce motion" setting for every framer-motion animation. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </SessionProvider>
  );
}
