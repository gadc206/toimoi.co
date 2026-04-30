import Link from "next/link"

const offerings = [
  {
    title: "Coaching",
    description: "Refine how you communicate, express yourself, and connect with ease."
  },
  {
    title: "Matchmaking",
    description: "Carefully curated introductions aligned with who you are and what you truly want."
  },
  {
    title: "Guidance",
    description: "We stay with you throughout the process, offering clarity, honesty, and perspective."
  }
]

export function WhatWeDo() {
  return (
    <section className="py-24 md:py-32 px-6 bg-secondary/50">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl font-light text-center text-foreground mb-16">
          What We Do
        </h2>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {offerings.map((offering) => (
            <div key={offering.title} className="text-center">
              <h3 className="font-serif text-xl md:text-2xl font-light text-foreground mb-4">
                {offering.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {offering.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            href="#services"
            className="inline-block px-8 py-4 border border-foreground/20 text-foreground text-sm tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-500"
          >
            Explore Our Services
          </Link>
        </div>
      </div>
    </section>
  )
}
