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
    <div className="px-6 py-4 backdrop-premium border-t border-border" style={{
      borderTop: "1px solid rgba(184, 98, 31, 0.2)",
      boxShadow: "rgba(184, 98, 31, 0.1) 0px 0px 20px"
    }}>
      <div className="flex items-center justify-around">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center space-y-1 px-4 py-2 transition-all min-h-[56px]`}
              style={active ? {
                color: '#D08C3A'
              } : {
                color: 'text-muted-foreground hover:text-copper hover:bg-copper/5 active:bg-copper/10'
              }}
            >
              <Icon
                className="h-6 w-6"
                style={active ? {
                  background: 'linear-gradient(135deg, #B8611E 0%, #D08C3A 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 4px rgba(184, 98, 31, 0.4))'
                } : {}}
              />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
