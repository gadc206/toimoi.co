import Link from "next/link"

export function ClosingSection() {
  return (
    <section className="py-32 md:py-40 px-6 bg-gradient-to-b from-background to-secondary/30 relative overflow-hidden">
      {/* Faded crystal backgrounds */}
      <div 
        className="absolute top-0 left-0 w-[400px] h-[400px] opacity-25 pointer-events-none"
        style={{
          backgroundImage: "url('/images/crystal-bg-1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-[450px] h-[450px] opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url('/images/crystal-bg-2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <p className="font-serif text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-foreground text-balance">
          When you feel aligned with yourself,
          <br />
          the right person no longer feels far.
        </p>

        <Link
          href="#contact"
          className="inline-block mt-12 px-10 py-5 bg-foreground text-background text-sm tracking-widest uppercase hover:bg-foreground/90 transition-all duration-500"
        >
          Start Your Journey
        </Link>

        <p className="mt-16 font-serif text-lg italic text-muted-foreground">
          Not everyone is for everyone.
          <br />
          We are here to help you find the one who is.
        </p>
      </div>
    </section>
  )
}
