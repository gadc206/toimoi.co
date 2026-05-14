import { cn } from "@/lib/utils"

type SectionEyebrowProps = {
  children: React.ReactNode
  className?: string
}

/**
 * Small label above a section so each block reads as its own “chapter”.
 */
export function SectionEyebrow({ children, className }: SectionEyebrowProps) {
  return (
    <div
      className={cn(
        "mb-8 border-b border-foreground/10 pb-5",
        className,
      )}
    >
      <span className="font-sans text-[11px] font-medium tracking-[0.32em] text-muted-foreground uppercase">
        {children}
      </span>
    </div>
  )
}
