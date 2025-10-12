'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home as HomeIcon, FileText, User } from 'lucide-react';

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: HomeIcon, label: 'Home' },
    { href: '/myBounties', icon: FileText, label: 'My Bounties' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(href);
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-around">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center space-y-2 px-4 py-3 rounded-2xl transition-all min-h-[60px] min-w-[80px] ${
                active
                  ? 'text-emerald-600 bg-emerald-100'
                  : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
