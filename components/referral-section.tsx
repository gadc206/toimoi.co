import Link from "next/link"

export function ReferralSection() {
  return (
    <section className="py-24 md:py-32 px-6 bg-secondary/50">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-2xl md:text-3xl font-light text-foreground mb-6">
          Referral Privilege
        </h2>

        <p className="text-muted-foreground leading-relaxed mb-8">
          Introduce someone to our service, and as a token of appreciation, you will receive one curated match at no cost.
        </p>

        <Link
          href="#referral"
          className="inline-block px-8 py-4 border border-foreground/20 text-foreground text-sm tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-500"
        >
          Refer & Book
        </Link>
      </div>
    </section>
  )
}
