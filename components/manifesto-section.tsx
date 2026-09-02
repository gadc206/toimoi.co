import { ParallaxWord } from "@/components/parallax-word"
import { Reveal } from "@/components/reveal"

export function ManifestoSection() {
  return (
    <section className="flex min-h-[100svh] flex-col items-center justify-center bg-background px-6 py-32">
      <Reveal className="max-w-4xl text-center">
        <p className="display text-[clamp(1.85rem,4.2vw,3.6rem)] leading-[1.15] text-foreground">
          Finding someone is not about
          <br />
          finding the perfect person.
        </p>
        <p className="display mt-16 text-[clamp(1.85rem,4.2vw,3.6rem)] leading-[1.15] text-foreground">
          It is about recognizing
          <br />
          <ParallaxWord className="display-italic text-[clamp(2.6rem,7vw,6.5rem)]">
            the right one.
          </ParallaxWord>
        </p>
      </Reveal>
    </section>
  )
}
