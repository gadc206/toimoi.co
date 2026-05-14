import { cn } from "@/lib/utils"

/** Shared rhythm: slightly tighter than before so the page feels less “stretched”. */
export const sectionY = "py-20 md:py-28"
export const sectionX = "px-5 sm:px-6"

type SectionShellProps = {
  id?: string
  className?: string
  /** Inner content wrapper — default centered column */
  children: React.ReactNode
  /** Narrow (text), medium (forms), wide (grids) */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "5xl" | "6xl" | "none"
}

const maxW = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  none: "max-w-none",
} as const

/**
 * Consistent horizontal padding + max width so sections don’t feel “all over the place”.
 */
export function SectionShell({
  id,
  className,
  children,
  maxWidth = "2xl",
}: SectionShellProps) {
  return (
    <div
      id={id}
      className={cn(
        "relative z-10 mx-auto w-full",
        sectionX,
        maxW[maxWidth],
        className,
      )}
    >
      {children}
    </div>
  )
}
