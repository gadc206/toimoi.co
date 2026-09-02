import Image from "next/image"

import { cn } from "@/lib/utils"

type CrystalBackdropProps = {
  src: string
  /** Tailwind classes for the photo layer (opacity, blur, etc.) */
  imageClassName?: string
  /** Tailwind classes for the gradient wash on top of the photo */
  overlayClassName?: string
  /** Slow ken-burns drift. Honors prefers-reduced-motion via CSS. */
  drift?: boolean
}

/**
 * Decorative full-bleed background used behind several sections.
 * Parent must be `relative overflow-hidden` (plus padding as needed).
 */
export function CrystalBackdrop({
  src,
  imageClassName = "opacity-30",
  overlayClassName = "bg-gradient-to-b from-background/70 via-background/50 to-background/70",
  drift = false,
}: CrystalBackdropProps) {
  return (
    <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
      <Image
        src={src}
        alt=""
        fill
        className={cn("object-cover", drift && "animate-crystal-drift", imageClassName)}
        sizes="100vw"
      />
      <div className={cn("absolute inset-0", overlayClassName)} />
    </div>
  )
}
