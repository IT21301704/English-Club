import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Photo panel, desktop only */}
      <div className="relative hidden lg:block overflow-hidden bg-brand-950">
        <Image src="/images/library.jpg" alt="" fill sizes="50vw" className="object-cover opacity-60 animate-kenburns" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="font-display italic text-4xl leading-snug max-w-md">“Language is the road map of a culture.”</p>
          <p className="mt-4 text-sm uppercase tracking-[0.25em] text-gold-300">Rita Mae Brown</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-4 bg-gradient-to-br from-brand-50 via-white to-gold-50">
        {children}
      </div>
    </div>
  );
}
