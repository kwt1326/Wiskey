'use client';

import * as React from "react";

import { cn } from "./utils";

interface InputProps extends Omit<React.ComponentProps<"input">, "variant"> {
  variant?: "default" | "premium";
}

function Input({ className, type, variant = "default", ...props }: InputProps) {
  const variantStyles: Record<"default" | "premium", string> = {
    default: "dark:bg-input/30 bg-input-background border-input",
    premium: "bg-[rgba(26,26,26,0.8)] border-white/10 focus-visible:border-[#b8621f] focus-visible:ring-[#b8621f]/20 focus-visible:shadow-[0_0_15px_rgba(184,98,31,0.2)]",
  };

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Input };
