'use client';

import type { ReactNode } from 'react';

import { AppStateProvider } from '@/components/appStateWithAPI';
import { Toaster } from '@/components/ui/sonner';

export default function MobileLayout({ children }: { children: ReactNode }) {

  return (
    <AppStateProvider>
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 mx-auto overflow-hidden">
          <div className="flex flex-1 flex-col min-h-0">{children}</div>
        </div>
        <Toaster />
      </main>
    </AppStateProvider>
  );
}
