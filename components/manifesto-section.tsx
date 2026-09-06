import { ParallaxWord } from "@/components/parallax-word"
import { Reveal } from "@/components/reveal"

export function ManifestoSection() {
  return (
    <section className="flex min-h-0 flex-col items-center justify-center bg-background px-6 py-20 md:min-h-[100svh] md:py-32">
      <Reveal className="w-full max-w-[20.5rem] text-center sm:max-w-4xl">
        <p className="display text-[1.7rem] leading-[1.25] text-foreground sm:text-[clamp(2.15rem,5vw,4.2rem)] sm:leading-[1.15]">
          Finding someone is not about
          <br />
          finding the <span className="italic">perfect person.</span>
        </p>
        <p className="display mt-10 text-[1.7rem] leading-[1.25] text-foreground sm:mt-24 sm:text-[clamp(2.15rem,5vw,4.2rem)] sm:leading-[1.15]">
          It is about recognizing
          <br />
          <span className="italic sm:hidden">the right one.</span>
          <ParallaxWord className="display-italic hidden text-[clamp(3rem,8vw,7.2rem)] sm:inline">
            the right one.
          </ParallaxWord>
        </p>
      </Reveal>
    </section>
  )
}
