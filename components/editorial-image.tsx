"use client"

import Image from "next/image"

import { Reveal } from "@/components/reveal"
import { cn } from "@/lib/utils"

type EditorialImageProps = {
  src: string
  alt: string
  className?: string
  imageClassName?: string
  sizes?: string
  priority?: boolean
  mono?: boolean
  delay?: number
}

export function EditorialImage({
  src,
  alt,
  className,
  imageClassName,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority,
  mono,
  delay,
}: EditorialImageProps) {
  return (
    <Reveal
      delay={delay}
      className={cn("group/photo relative h-full w-full overflow-hidden", className)}
      data-cursor="image"
    >
      <div className="reveal-clip">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn(
            "object-cover",
            mono ? "photo-editorial photo-mono" : "photo-editorial",
            imageClassName,
          )}
        />
      </div>
    </Reveal>
  )
}
