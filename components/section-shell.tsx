import { cn } from "@/lib/utils"

export const sectionY = "py-24 md:py-32"
export const sectionX = "px-6 sm:px-8"

type SectionShellProps = {
  id?: string
  className?: string
  children: React.ReactNode
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
  "6xl": "max-w-[1200px]",
  none: "max-w-none",
} as const

export function SectionShell({
  id,
  className,
  children,
  maxWidth = "6xl",
}: SectionShellProps) {
  return (
    <div
      id={id}
      className={cn("relative z-10 mx-auto w-full", sectionX, maxW[maxWidth], className)}
    >
      {children}
    </div>
  )
}
