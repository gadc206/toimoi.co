import Image from "next/image"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Crystal Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/crystal-hero.jpg"
          alt=""
          fill
          className="object-cover opacity-40 blur-sm"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 animate-fade-in">
          Jewish Matchmaking
        </p>
        
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-tight text-foreground animate-fade-in text-balance">
          Finding your soulmate should feel calm, guided, and natural.
        </h1>
        
        <p className="mt-6 font-serif text-xl md:text-2xl font-light text-muted-foreground italic animate-fade-in-delay-1">
          Not rushed. Not forced.
        </p>
        
        <p className="mt-8 text-base md:text-lg text-muted-foreground leading-relaxed animate-fade-in-delay-2">
          A thoughtful, personal approach to meaningful connection.
        </p>

        <Link
          href="#services"
          className="inline-block mt-12 px-8 py-4 border border-foreground/20 text-foreground text-sm tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-500 animate-fade-in-delay-3"
        >
          Begin Your Journey
        </Link>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-fade-in-delay-3">
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-foreground/30 to-transparent" />
      </div>
    </section>
  )
}
