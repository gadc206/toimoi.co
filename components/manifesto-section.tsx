import { ParallaxWord } from "@/components/parallax-word"
import { Reveal } from "@/components/reveal"

export function ManifestoSection() {
  return (
    <section className="flex min-h-0 flex-col items-center justify-center bg-background px-6 py-16 md:min-h-[100svh] md:py-32">
      <Reveal className="max-w-4xl text-center">
        <p className="display text-justify text-[clamp(1.7rem,6.4vw,2.35rem)] leading-[1.35] text-foreground sm:hidden">
          Finding someone is not about finding the perfect person. It is about recognizing the
          right one.
        </p>
        <div className="hidden sm:block">
          <p className="display text-[clamp(2.15rem,5vw,4.2rem)] leading-[1.15] text-foreground">
            Finding someone is not about
            <br />
            finding the perfect person.
          </p>
          <p className="display mt-16 text-[clamp(2.15rem,5vw,4.2rem)] leading-[1.15] text-foreground">
            It is about recognizing
            <br />
            <ParallaxWord className="display-italic text-[clamp(3rem,8vw,7.2rem)]">
              the right one.
            </ParallaxWord>
          </p>
        </div>
      </Reveal>
    </section>
  )
}
