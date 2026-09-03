"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const siteButtonVariants = cva(
  "group inline-flex items-center justify-center gap-3 font-sans text-[13px] font-medium tracking-[0.22em] uppercase transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/30 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        outline: "text-foreground",
        "outline-sm": "text-[10px] tracking-[0.22em] text-foreground",
        solid: "text-foreground",
        inverse: "text-background",
        "inverse-outline": "text-background",
        "footer-link":
          "gap-0 text-[10px] tracking-[0.2em] text-background/50 hover:text-background",
      },
      size: {
        cta: "w-auto min-w-0",
        block: "w-auto min-w-0",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "cta",
    },
  },
)

export type SiteButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof siteButtonVariants> & {
    asChild?: boolean
    arrow?: boolean
  }

const SiteButton = React.forwardRef<HTMLButtonElement, SiteButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      type,
      arrow,
      children,
      onMouseMove,
      onMouseLeave,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button"
    const showArrow = !asChild && (arrow ?? variant !== "footer-link")

    const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseMove?.(e)
      if (variant === "footer-link") return
      const el = e.currentTarget
      const r = el.getBoundingClientRect()
      const x = e.clientX - (r.left + r.width / 2)
      const y = e.clientY - (r.top + r.height / 2)
      el.style.transform = `translate(${x * 0.14}px, ${y * 0.18}px)`
    }

    const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseLeave?.(e)
      e.currentTarget.style.transform = ""
    }

    const content = showArrow ? (
      <>
        <span className="underline-lux">{children}</span>
        <span className="cta-arrow" aria-hidden>
          →
        </span>
      </>
    ) : (
      children
    )

    return (
      <Comp
        ref={ref as React.Ref<HTMLButtonElement>}
        type={asChild ? undefined : type ?? "button"}
        data-magnetic=""
        className={cn(siteButtonVariants({ variant, size }), className)}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        {...props}
      >
        {content}
      </Comp>
    )
  },
)
SiteButton.displayName = "SiteButton"

export { SiteButton, siteButtonVariants }
