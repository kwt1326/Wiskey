import { ReactNode } from "react";

export default function PageMainWrapper({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative flex flex-1 flex-col min-h-0"
      style={{
        width: "100vw",
        maxHeight: "calc(100vh - var(--mobile-bottom-section-height, 0px))"
      }}
    >
      {children}
    </div>
  )
}
