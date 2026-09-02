import { CrystalBackdrop } from "@/components/crystal-backdrop"
import { Reveal } from "@/components/reveal"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { SectionShell, sectionY } from "@/components/section-shell"
import { sectionSurfaceClass } from "@/lib/section-surfaces"
import { cn } from "@/lib/utils"

export function FeelingSection() {
  return (
    <section
      id="feeling"
      className={cn(
        sectionY,
        sectionSurfaceClass("sage"),
        "relative overflow-hidden scroll-mt-24",
      )}
    >
      <CrystalBackdrop
        src="/images/crystal-bg-1.jpg"
        drift
        imageClassName="opacity-[0.2]"
        overlayClassName="bg-gradient-to-b from-[oklch(0.965_0.014_155/0.92)] via-[oklch(0.965_0.014_155/0.78)] to-[oklch(0.965_0.014_155/0.9)]"
      />
      <SectionShell maxWidth="2xl" className="text-center">
        <Reveal>
          <SectionEyebrow>The moment</SectionEyebrow>
          <p className="font-serif text-2xl font-light leading-relaxed text-foreground md:text-3xl">
            In a world that moves fast and lives behind screens, real connection has become rare.
          </p>

          <p className="mt-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
            We help you slow down, reconnect with yourself, and meet someone in a way that feels real
            again.
          </p>

          <div className="mx-auto mt-10 h-px w-16 bg-foreground/15" />

          <p className="mt-10 font-serif text-xl font-light italic text-foreground md:text-2xl">
            This is not about endless swiping.
            <br />
            This is about finding the one who was meant for you.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-12 font-serif text-xl font-light leading-relaxed text-foreground md:text-2xl">
            We work quietly, with care, and with intention.
          </p>
          <div className="mx-auto mt-8 max-w-md space-y-3 text-muted-foreground">
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
        </Reveal>
      </SectionShell>
    </section>
  )
}
