'use client';

import React from 'react';
import { Home as HomeIcon, FileText, User } from 'lucide-react';
import type { Screen } from '@/components/types';

interface BottomNavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function BottomNavigation({ currentScreen, onNavigate }: BottomNavigationProps) {
  const navItems = [
    { screen: 'home' as Screen, icon: HomeIcon, label: 'Home' },
    { screen: 'my-bounties' as Screen, icon: FileText, label: 'My Bounties' },
    { screen: 'profile' as Screen, icon: User, label: 'Profile' }
  ];

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-around">
        {navItems.map(({ screen, icon: Icon, label }) => {
          const isActive = currentScreen === screen;
          
          return (
            <button
              key={screen}
              onClick={() => onNavigate(screen)}
              className={`flex flex-col items-center space-y-2 px-4 py-3 rounded-2xl transition-all min-h-[60px] min-w-[80px] ${
                isActive
                  ? 'text-emerald-600 bg-emerald-100'
                  : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
