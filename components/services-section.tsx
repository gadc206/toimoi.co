import Link from "next/link"

export function ServicesSection() {
  return (
    <section id="services" className="py-24 md:py-32 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl font-light text-center text-foreground mb-4">
          Work With Us
        </h2>
        <p className="text-center text-muted-foreground mb-20">
          Each offering is designed with intention and care
        </p>

        <div className="space-y-20">
          {/* Discovery Call */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-16 border-b border-border">
            <div className="flex-1">
              <h3 className="font-serif text-2xl md:text-3xl font-light text-foreground mb-4">
                Discovery Call
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                A 15-minute conversation to see if we are the right fit for each other. No pressure. No commitment. Just an honest first connection.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-4">
              <span className="font-serif text-xl text-foreground italic">
                Complimentary
              </span>
              <Link
                href="#discovery"
                className="text-sm tracking-widest uppercase text-foreground hover:text-muted-foreground transition-colors duration-300 group"
              >
                Book Your Free Call
                <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>

          {/* Personal Consultation */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-16 border-b border-border">
            <div className="flex-1">
              <h3 className="font-serif text-2xl md:text-3xl font-light text-foreground mb-4">
                Personal Consultation
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                A deeply personal in-person meeting where we take the time to truly understand who you are, what you have been through, and what you are genuinely looking for. This is where your journey begins.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-4">
              <div className="text-right">
                <span className="font-serif text-xl text-foreground">$350</span>
                <p className="text-sm text-muted-foreground mt-1">One Hour</p>
              </div>
              <Link
                href="#consultation"
                className="text-sm tracking-widest uppercase text-foreground hover:text-muted-foreground transition-colors duration-300 group"
              >
                Book Your Consultation
                <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>

          {/* Clarity & Connection Session */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-16 border-b border-border">
            <div className="flex-1">
              <h3 className="font-serif text-2xl md:text-3xl font-light text-foreground mb-4">
                Clarity & Connection Session
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                A personalized one on one experience designed to help you gain clarity, strengthen your confidence, refine the way you communicate, and better understand the relationship patterns that may be holding you back. True connection begins with self awareness, presence, and authenticity.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-4">
              <span className="font-serif text-xl text-foreground">$500</span>
              <Link
                href="#coaching"
                className="text-sm tracking-widest uppercase text-foreground hover:text-muted-foreground transition-colors duration-300 group"
              >
                Book Your Session
                <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>

          {/* The Signature Experience */}
          <div className="pt-8">
            <div className="bg-foreground text-background p-10 md:p-14">
              <p className="text-sm tracking-widest uppercase text-background/60 mb-6 text-center">
                Our Most Intimate Offering
              </p>
              <h3 className="font-serif text-3xl md:text-4xl font-light text-center text-background mb-8">
                The Signature Experience
              </h3>
              
              <div className="max-w-2xl mx-auto space-y-6 text-background/80 leading-relaxed text-center text-lg">
                <p>
                  A fully bespoke six-month journey built entirely around you — your story, your values, and your vision for love.
                </p>
                <p>
                  Every introduction is carefully considered. Every step is personally guided. Every conversation is held with complete discretion and care.
                </p>
              </div>

              <div className="mt-10 pt-10 border-t border-background/20 max-w-2xl mx-auto">
                <p className="text-sm tracking-widest uppercase text-background/60 mb-4 text-center">
                  Includes
                </p>
                <ul className="text-background/80 space-y-3 text-center">
                  <li>Coaching Sessions</li>
                  <li>Personal Image Transformation</li>
                </ul>
                <p className="mt-6 text-background/60 text-sm text-center italic">
                  Refine your presence in a way that feels natural, elevated, and completely true to you.
                </p>
              </div>

              <div className="mt-12 text-center">
                <p className="font-serif text-lg text-background/60 italic mb-2">
                  We do not offer this to everyone.
                </p>
                <p className="font-serif text-lg text-background mb-8">
                  We offer it to those who are truly ready.
                </p>
                
                <p className="text-background/60 text-sm mb-8">
                  Pricing is discussed privately following your in-person consultation,<br />
                  because no two journeys are the same.
                </p>

                <Link
                  href="#signature"
                  className="inline-block px-8 py-4 border border-background/30 text-background text-sm tracking-widest uppercase hover:bg-background hover:text-foreground transition-all duration-500"
                >
                  Begin Your Journey
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
