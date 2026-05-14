import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const siteButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 text-center text-sm font-normal tracking-widest uppercase transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        outline:
          "min-h-[3.25rem] border border-foreground/20 bg-transparent text-foreground hover:bg-foreground hover:text-background",
        "outline-sm":
          "min-h-0 border border-foreground/25 bg-background/60 px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-foreground shadow-sm backdrop-blur-sm hover:bg-foreground hover:text-background",
        solid:
          "min-h-[3.25rem] border border-transparent bg-foreground text-background hover:bg-foreground/90",
        "inverse-outline":
          "min-h-[3.25rem] border border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground",
        "footer-link":
          "min-h-0 border-0 bg-transparent px-2 py-1 text-sm font-normal normal-case tracking-normal text-background/70 hover:text-background",
      },
      size: {
        /** Same width class for every framed CTA */
        cta: "w-full min-w-0 px-8 py-3.5 sm:w-auto sm:min-w-[13.5rem]",
        /** Full-width on small screens (forms) */
        block: "w-full min-w-0 px-8 py-3.5 sm:w-auto sm:min-w-[13.5rem]",
      },
    },
    compoundVariants: [
      {
        variant: "footer-link",
        size: "cta",
        className: "w-auto min-w-0 px-2 sm:min-w-0",
      },
      {
        variant: "footer-link",
        size: "block",
        className: "w-auto min-w-0 px-2 sm:min-w-0",
      },
      {
        variant: "outline-sm",
        size: "cta",
        className: "w-auto sm:min-w-0",
      },
      {
        variant: "outline-sm",
        size: "block",
        className: "w-full sm:w-auto sm:min-w-0",
      },
    ],
    defaultVariants: {
      variant: "outline",
      size: "cta",
    },
  },
)

export type SiteButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof siteButtonVariants> & {
    asChild?: boolean
  }

const SiteButton = React.forwardRef<HTMLButtonElement, SiteButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref as React.Ref<HTMLButtonElement>}
        type={asChild ? undefined : type ?? "button"}
        className={cn(siteButtonVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)
SiteButton.displayName = "SiteButton"

export { SiteButton, siteButtonVariants }
