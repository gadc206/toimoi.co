import Image from "next/image"

export function AboutSection() {
  return (
    <section className="py-24 md:py-32 px-6 bg-background relative overflow-hidden">
      {/* Faded crystal background */}
      <div 
        className="absolute bottom-0 left-0 w-[450px] h-[450px] opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url('/images/crystal-bg-2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="order-2 md:order-1">
            <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-8">
              About Us
            </h2>

            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
              <p>
                We are not a big company or an app.
              </p>

              <p className="font-serif text-foreground italic">
                We are real people who take the time to truly see you.
              </p>

              <p>
                What we do goes beyond experience or process. There is a deep level of intuition in the way we work, almost like a sixth sense. We listen not only to your words, but to what sits underneath them. We feel what is aligned and what is not, even when it is not obvious.
              </p>

              <p>
                Together, our thoughts and perspectives create clarity. We help you understand who you truly are, what your needs are, and what your soul is really searching for — not just what you think you want on the surface.
              </p>

              <p>
                This process is personal, it is intentional and honest. There is no template, no formula, no shortcut. Every person we work with receives individual care, real attention, and guidance that is tailored specifically to them.
              </p>

              <p className="font-serif text-foreground italic">
                We don&apos;t believe we are the ones &quot;making&quot; the match.
              </p>

              <p>
                We are the vessel. Hashem is the one making the match. A vessel that helps bring two people together at the right time, in the right way, when they are ready.
              </p>

              <p className="font-serif text-foreground">
                There is something powerful that happens when intuition, honesty, and timing align. That is where real connection begins.
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
