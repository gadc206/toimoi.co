import { CrystalBackdrop } from "@/components/crystal-backdrop"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { SectionShell, sectionY } from "@/components/section-shell"
import { sectionSurfaceClass } from "@/lib/section-surfaces"
import { cn } from "@/lib/utils"

export function TrustSection() {
  return (
    <section
      id="trust"
      className={cn(
        sectionY,
        sectionSurfaceClass("cream"),
        "relative overflow-hidden scroll-mt-36",
      )}
    >
      <CrystalBackdrop
        src="/images/crystal-overlay.jpg"
        imageClassName="opacity-[0.12] blur-md"
        overlayClassName="bg-[oklch(0.985_0.006_82/0.88)]"
      />

      <SectionShell maxWidth="2xl" className="text-center">
        <SectionEyebrow>Our standard</SectionEyebrow>
        <p className="font-serif text-2xl font-light leading-relaxed text-foreground md:text-3xl">
          We work quietly, with care, and with intention.
        </p>

        <div className="mx-auto mt-10 max-w-md space-y-3 text-muted-foreground">
          <p>Every person we meet is treated with respect and discretion.</p>
          <p>Every introduction is thoughtful.</p>
          <p>Every step is guided.</p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-sans text-xs tracking-[0.22em] text-foreground/60 uppercase">
          <span>Private</span>
          <span className="hidden h-1 w-1 rounded-full bg-foreground/25 sm:inline-block" />
          <span>Personal</span>
          <span className="hidden h-1 w-1 rounded-full bg-foreground/25 sm:inline-block" />
          <span>Trusted</span>
        </div>
      </SectionShell>
    </section>
  )
}
