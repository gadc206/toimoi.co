import Image from "next/image"

export function AboutSection() {
  return (
    <section className="py-24 md:py-32 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="order-2 md:order-1">
            <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-8">
              About Us
            </h2>

            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                We come from a background of building, understanding people, and creating meaningful connections in different areas of life.
              </p>

              <p>
                Over time, we realized that the most important connection someone can make is finding the right partner.
              </p>

              <p>
                Dating today is not lacking good people. It is lacking clarity, guidance, and real understanding.
              </p>

              <p className="font-serif text-foreground italic">
                That is why we created this space.
              </p>

              <p>
                We take the time to truly understand each person, beyond what is said on the surface. Our approach is personal, honest, and deeply intentional.
              </p>

              <p className="font-serif text-foreground">
                Because when something is guided the right way, it unfolds naturally.
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 md:order-2">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/crystal-overlay.jpg"
                alt="Peaceful crystals"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
