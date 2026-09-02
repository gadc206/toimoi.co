import Image from "next/image"

import { cn } from "@/lib/utils"

const sizes = {
  xs: { className: "h-8 w-8", px: 32, src: "/apple-icon.png" },
  sm: { className: "h-9 w-9", px: 36, src: "/apple-icon.png" },
  md: { className: "h-11 w-11", px: 44, src: "/apple-icon.png" },
  lg: { className: "h-28 w-28 sm:h-32 sm:w-32", px: 160, src: "/toimoi-wordmark.png" },
} as const

type BrandMarkProps = {
  size?: keyof typeof sizes
  className?: string
  priority?: boolean
}

export function BrandMark({ size = "sm", className, priority }: BrandMarkProps) {
  const s = sizes[size]
  return (
    <Image
      src={s.src}
      alt="ToiMoi"
      width={s.px}
      height={s.px}
      priority={priority}
      className={cn("rounded-sm object-cover shadow-sm", s.className, className)}
    />
  )
}
