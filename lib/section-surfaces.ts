import { cn } from "@/lib/utils"

/** Alternating beige / light green so the page stays airy, never bulky. */
export const sectionSurface = {
  sage: "bg-[var(--sage)]",
  paper: "bg-background",
  cream: "bg-[#efe8d9]",
  sand: "bg-[var(--sage)]",
} as const

export type SectionSurfaceKey = keyof typeof sectionSurface

export function sectionSurfaceClass(key: SectionSurfaceKey) {
  return cn(sectionSurface[key])
}
