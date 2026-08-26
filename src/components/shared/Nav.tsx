'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// Matches the shared Cense mark used across the other products: a rounded
// brand-green square with a white "C".
const LOGO = (
  <div className="w-7 h-7 rounded-lg bg-[#275B2D] flex items-center justify-center">
    <span className="text-white text-xs font-bold">C</span>
  </div>
);

export function Nav() {
  const path = usePathname();

  const links = [
    { href: '/', label: 'Find My Card' },
    { href: '/cards', label: 'Cards We Consider' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-page/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <a
          href="https://cense.beehiiv.com"
          className="flex items-center gap-2 shrink-0 rounded-lg hover:opacity-75 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#275B2D] focus-visible:ring-offset-2"
          aria-label="Cense newsletter home"
        >
          {LOGO}
          <span className="font-bold text-[#275B2D] text-base tracking-tight">Cense</span>
        </a>
        <nav className="flex gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                path === l.href || (l.href === '/' && (path === '/' || path === '/results'))
                  ? 'bg-[#EAF3E7] text-[#275B2D]'
                  : 'text-slate-600 hover:text-[#275B2D] hover:bg-slate-100'
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
