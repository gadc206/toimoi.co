import { CrystalBackdrop } from "@/components/crystal-backdrop"
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
        "relative overflow-hidden scroll-mt-36",
      )}
    >
      <CrystalBackdrop
        src="/images/crystal-bg-1.jpg"
        imageClassName="opacity-[0.22]"
        overlayClassName="bg-gradient-to-b from-[oklch(0.965_0.014_155/0.92)] via-[oklch(0.965_0.014_155/0.75)] to-[oklch(0.965_0.014_155/0.88)]"
      />
      <SectionShell maxWidth="2xl" className="text-center">
        <SectionEyebrow>The moment</SectionEyebrow>
        <p className="font-serif text-2xl font-light leading-relaxed text-foreground md:text-3xl">
          In a world that moves fast and lives behind screens, real connection has become rare.
        </p>

        <p className="mt-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
          We help you slow down, reconnect with yourself, and meet someone in a way that feels real again.
        </p>

        <div className="mx-auto mt-10 h-px w-16 bg-foreground/15" />

        <p className="mt-10 font-serif text-xl font-light italic text-foreground md:text-2xl">
          This is not about endless swiping.
          <br />
          This is about finding the one who was meant for you.
        </p>
      </SectionShell>
    </section>
  )
}
