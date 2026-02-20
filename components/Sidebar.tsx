'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', label: 'Overview', icon: '◎' },
  { href: '/operations', label: 'Operations', icon: '⌁' },
  { href: '/marketing', label: 'Marketing', icon: '✦' },
  { href: '/research', label: 'Research', icon: '⟡' },
  { href: '/tasks', label: 'Tasks', icon: '☐' },
  { href: '/content', label: 'Content', icon: '✎' },
  { href: '/calendar', label: 'Calendar', icon: '▦' },
  { href: '/memory', label: 'Memory', icon: '◉' },
  { href: '/team', label: 'Team', icon: '⊕' },
  { href: '/org-chart', label: 'Org Chart', icon: '⬡' },
  { href: '/doctor', label: 'Doctor', icon: '⚕' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="font-bold text-sm tracking-wide text-gray-200 mb-4 px-2.5">
        OPENCLAW MISSION CONTROL
      </div>
      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const active = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-white/[0.08] text-white'
                  : 'text-gray-400 hover:bg-white/[0.05] hover:text-gray-200'
              }`}
            >
              <span className="text-xs opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 px-2.5 text-xs text-gray-500">
        Local-only v1. Office excluded.
      </div>
    </div>
  );
}
