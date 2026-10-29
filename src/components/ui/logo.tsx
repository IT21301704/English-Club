import Image from 'next/image';
import { cn } from '@/lib/utils';

/** The "EC" quill-and-book mark, on a white tile so it also reads on dark backgrounds. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-9 h-9 shrink-0 rounded-lg bg-white ring-1 ring-black/5 overflow-hidden', className)}>
      <Image src="/logo-mark.png" alt="English Club logo" fill sizes="64px" className="object-contain p-0.5" priority />
    </div>
  );
}

/** The "ENGLISH CLUB" lettering from the logo, for horizontal lockups next to LogoMark. */
export function LogoWordmark({ className }: { className?: string }) {
  return (
    <Image src="/logo-wordmark.png" alt="English Club" width={959} height={100}
      className={cn('h-4 w-auto', className)} priority />
  );
}

/** The complete logo: mark, wordmark and gold rule. */
export function LogoFull({ className }: { className?: string }) {
  return (
    <Image src="/logo.png" alt="English Club" width={999} height={675}
      className={cn('w-48 h-auto', className)} priority />
  );
}
