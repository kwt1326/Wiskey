"use client";
import { ReactNode } from "react";
import { AppProviders } from "@/providers";

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <AppProviders>
      {children}
    </AppProviders>
  );
}
