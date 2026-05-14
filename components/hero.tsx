import Image from "next/image"
import Link from "next/link"

import { SiteButton } from "@/components/site-button"

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-[5.5rem] sm:pt-24 md:pt-28">
      <div className="absolute inset-0">
        <Image
          src="/images/crystal-hero.jpg"
          alt=""
          fill
          className="object-cover opacity-[0.52] blur-[3px]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/32 to-background" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <p className="animate-fade-in font-sans text-xs tracking-[0.32em] text-muted-foreground uppercase">
          Jewish matchmaking
        </p>

        <h1 className="animate-fade-in mt-8 text-balance font-serif text-4xl font-light leading-[1.15] text-foreground md:text-5xl lg:text-6xl">
          Finding your soulmate should feel calm, guided, and natural.
        </h1>

        <p className="animate-fade-in-delay-1 mt-6 font-serif text-xl font-light italic text-muted-foreground md:text-2xl">
          Not rushed. Not forced. Not by an algorithm.
        </p>

        <p className="animate-fade-in-delay-2 mt-8 text-base leading-relaxed text-muted-foreground md:text-lg">
          A thoughtful, personal approach to meaningful connection.
        </p>

        <SiteButton
          asChild
          variant="outline"
          className="mt-12 animate-fade-in-delay-3"
        >
          <Link href="#services">Begin your journey</Link>
        </SiteButton>
      </div>
    </section>
  )
}
