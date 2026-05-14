import Image from "next/image"

export function FeelingSection() {
  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      {/* Full crystal background like hero */}
      <div className="absolute inset-0">
        <Image
          src="/images/crystal-bg-1.jpg"
          alt=""
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/70" />
      </div>
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <p className="font-serif text-2xl md:text-3xl font-light leading-relaxed text-foreground">
          In a world that moves fast and lives behind screens, real connection has become rare.
        </p>
        
        <p className="mt-10 text-xl text-muted-foreground leading-relaxed">
          We help you slow down, reconnect with yourself, and meet someone in a way that feels real again.
        </p>

        <div className="mt-12 w-16 h-px bg-border mx-auto" />

        <p className="mt-12 font-serif text-xl md:text-2xl font-light italic text-foreground">
          This is not about endless swiping.
          <br />
          This is about finding the one who was meant for you.
        </p>
      </div>
    </section>
  )
}
