import Link from "next/link"

export function ClosingSection() {
  return (
    <section className="py-32 md:py-40 px-6 bg-gradient-to-b from-background to-secondary/30">
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-serif text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-foreground text-balance">
          When you are ready to build a Jewish home,
          <br />
          your bashert is already waiting.
        </p>

        <Link
          href="#contact"
          className="inline-block mt-12 px-10 py-5 bg-foreground text-background text-sm tracking-widest uppercase hover:bg-foreground/90 transition-all duration-500"
        >
          Find Your Bashert
        </Link>

        <p className="mt-16 font-serif text-lg italic text-muted-foreground">
          Every Jewish soul has its match.
          <br />
          We are here to help you find yours.
        </p>
      </div>
    </section>
  )
}
