'use client';

import type { ReactNode } from 'react';

import { AppProviders } from '@/providers';
import { Toaster } from '@/components/ui/sonner';

export default function MobileLayout({ children }: { children: ReactNode }) {

  return (
    <AppProviders>
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="bg-gradient-to-br relative flex min-h-screen flex-col from-green-50 via-emerald-50 to-teal-50 mx-auto overflow-hidden">
          <div className="flex flex-1 flex-col min-h-0">{children}</div>
        </div>
        <Toaster />
      </main>
    </AppProviders>
  );
}
