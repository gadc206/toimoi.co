import Image from "next/image"

export function TrustSection() {
  return (
    <section className="relative py-24 md:py-32 px-6 overflow-hidden">
      {/* Subtle Crystal Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/crystal-overlay.jpg"
          alt=""
          fill
          className="object-cover opacity-20 blur-md"
        />
        <div className="absolute inset-0 bg-muted/80" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <p className="font-serif text-2xl md:text-3xl font-light leading-relaxed text-foreground">
          We work quietly, with care, and with intention.
        </p>

        <div className="mt-12 space-y-4 text-muted-foreground">
          <p>Every person we meet is treated with respect and discretion.</p>
          <p>Every introduction is thoughtful.</p>
          <p>Every step is guided.</p>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 text-sm tracking-widest uppercase text-foreground/70">
          <span>Private</span>
          <span className="w-1 h-1 bg-foreground/30 rounded-full" />
          <span>Personal</span>
          <span className="w-1 h-1 bg-foreground/30 rounded-full" />
          <span>Trusted</span>
        </div>
      </div>
    </section>
  )
}
