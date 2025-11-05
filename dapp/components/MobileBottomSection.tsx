'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import { BottomNavigation } from './BottomNavigation';
import { cn } from '@/components/ui/utils';

interface MobileBottomSectionProps {
  children?: ReactNode;
  brandingText?: string;
  className?: string;
}

export const MOBILE_BOTTOM_SECTION_CSS_VAR = '--mobile-bottom-section-height';
export const MOBILE_BOTTOM_SECTION_PADDING =
  `var(${MOBILE_BOTTOM_SECTION_CSS_VAR}, 0px)`;

export function MobileBottomSection({
  children,
  brandingText: _brandingText = 'Powered by Base',
  className,
}: MobileBottomSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateHeight = () => {
      const node = sectionRef.current;

      if (!node) {
        document.documentElement.style.setProperty(MOBILE_BOTTOM_SECTION_CSS_VAR, '0px');
        return;
      }

      document.documentElement.style.setProperty(
        MOBILE_BOTTOM_SECTION_CSS_VAR,
        `${node.offsetHeight}px`,
      );
    };

    updateHeight();

    let observer: ResizeObserver | undefined;

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateHeight);
      const node = sectionRef.current;

      if (node) {
        observer.observe(node);
      }
    }

    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);

      if (observer) {
        observer.disconnect();
      }

      document.documentElement.style.setProperty(MOBILE_BOTTOM_SECTION_CSS_VAR, '0px');
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className={cn(
        'fixed w-full bottom-0 left-0 right-0 bg-[#070707] border-t border-[#2a2a2a]',
        className,
      )}
      style={{ bottom: 0 }}
    >
      {children}
      <BottomNavigation />
    </div>
  );
}
