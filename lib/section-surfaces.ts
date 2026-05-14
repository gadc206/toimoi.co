import { cn } from "@/lib/utils"

/** Alternating “chapters” so one section never bleeds into the next. */
export const sectionSurface = {
  /** Soft sage wash — calm, distinct from pure white */
  sage: "border-t border-foreground/[0.07] bg-[oklch(0.965_0.014_155)]",
  /** Clean editorial white */
  paper: "border-t border-foreground/[0.07] bg-background",
  /** Warm cream — slightly different from paper */
  cream: "border-t border-foreground/[0.07] bg-[oklch(0.985_0.006_82)]",
  /** Deeper cream band */
  sand: "border-t border-foreground/[0.07] bg-[oklch(0.972_0.008_78)]",
} as const

export type SectionSurfaceKey = keyof typeof sectionSurface

export function sectionSurfaceClass(key: SectionSurfaceKey) {
  return cn(sectionSurface[key])
}
