import Link from "next/link"

const services = [
  {
    title: "Private Coaching Session",
    description: "A personalized 45-minute session designed to elevate your confidence, refine your communication, and help you express your true self with ease and authenticity.",
    price: "$500",
    cta: "Book Your Session",
    href: "#coaching"
  },
  {
    title: "Personal Consultation",
    description: "A one-on-one meeting to understand who you are on a deeper level, what you are truly looking for, and thoughtfully introduce you into our private, curated network.",
    price: "$499",
    cta: "Book Your Consultation",
    href: "#consultation"
  },
  {
    title: "Personal Image Transformation",
    description: "Refine your look in a way that feels natural, elevated, and true to you. Because when you feel your best, you show up differently in every interaction.",
    price: "$1,000",
    cta: "Book Your Transformation",
    href: "#transformation"
  }
]

export function ServicesSection() {
  return (
    <section id="services" className="py-24 md:py-32 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl font-light text-center text-foreground mb-4">
          Our Services
        </h2>
        <p className="text-center text-muted-foreground mb-16">
          Each offering is designed with intention and care
        </p>

        {/* Standard Services */}
        <div className="space-y-12">
          {services.map((service) => (
            <div
              key={service.title}
              className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-12 border-b border-border last:border-0"
            >
              <div className="flex-1">
                <h3 className="font-serif text-xl md:text-2xl font-light text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-xl">
                  {service.description}
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-4">
                <span className="font-serif text-xl text-foreground">
                  {service.price}
                </span>
                <Link
                  href={service.href}
                  className="text-sm tracking-widest uppercase text-foreground hover:text-muted-foreground transition-colors duration-300 group"
                >
                  {service.cta}
                  <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Matchmaking Section */}
        <div className="mt-16 pt-16 border-t border-border">
          <h3 className="font-serif text-2xl md:text-3xl font-light text-center text-foreground mb-8">
            Bespoke Matchmaking
          </h3>
          <p className="text-center text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-12">
            A highly personalized approach to finding your soulmate. Each introduction is carefully selected, intentional, and aligned with your values and vision.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Per Introduction */}
            <div className="bg-card p-8 text-center">
              <p className="text-sm tracking-widest uppercase text-muted-foreground mb-4">
                Per Introduction
              </p>
              <p className="font-serif text-3xl text-foreground mb-6">$1,500</p>
              <p className="text-muted-foreground text-sm mb-8">
                A single, thoughtfully curated introduction
              </p>
              <Link
                href="#matchmaking"
                className="inline-block px-6 py-3 border border-foreground/20 text-foreground text-sm tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-500"
              >
                Learn More
              </Link>
            </div>

            {/* Signature Experience */}
            <div className="bg-foreground text-background p-8 text-center">
              <p className="text-sm tracking-widest uppercase text-background/70 mb-4">
                The Signature Experience
              </p>
              <p className="font-serif text-3xl text-background mb-6">$10,000</p>
              <p className="text-background/80 text-sm mb-4">
                A full year of dedicated guidance
              </p>
              <ul className="text-background/70 text-sm space-y-2 mb-8">
                <li>Up to 6 curated matches</li>
                <li>6 private coaching sessions</li>
                <li>Ongoing support every step of the way</li>
              </ul>
              <Link
                href="#signature"
                className="inline-block px-6 py-3 border border-background/30 text-background text-sm tracking-widest uppercase hover:bg-background hover:text-foreground transition-all duration-500"
              >
                Begin Your Journey
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
