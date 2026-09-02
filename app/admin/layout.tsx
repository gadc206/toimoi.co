import type { CSSProperties, ReactNode } from "react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="toimo-admin min-h-screen bg-[var(--background)] text-[var(--foreground)]"
      style={
        {
          ["--muted"]: "oklch(0.45 0.01 60)",
          ["--accent"]: "#0f5c4c",
          ["--panel"]: "oklch(0.99 0.002 80)",
          ["--line"]: "oklch(0.90 0.008 80)",
          ["--ink"]: "oklch(0.30 0.01 60)",
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}
