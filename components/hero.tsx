export function Hero() {
  return (
    <section className="min-h-[70vh] md:min-h-[80vh] flex flex-col justify-center items-center text-center px-6 md:px-12 lg:px-24 pt-24 pb-12">
      <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6">
        Exclusive Matchmaking
      </p>
      <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light leading-tight text-foreground max-w-4xl text-balance">
        Work With Us
      </h1>
      <div className="w-16 h-px bg-border mt-10 mb-8" />
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed font-light">
        Where meaningful connections are cultivated with intention, discretion, and care.
      </p>
    </section>
  )
}
