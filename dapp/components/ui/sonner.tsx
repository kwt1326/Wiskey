/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import type { CSSProperties } from "react";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  
  const toastStyles: CSSProperties = {
    // @ts-ignore
    "--normal-bg": "var(--popover)",
    "--normal-text": "var(--popover-foreground)",
    "--normal-border": "var(--border)",
  };

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={toastStyles}
      {...props}
    />
  );
};

export { Toaster };
