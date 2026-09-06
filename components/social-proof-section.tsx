import { Reveal } from "@/components/reveal"

const stories = [
  {
    quote:
      "It felt personal from the first message. Not like another app — like someone was actually paying attention.",
    attribution: "Anonymous",
  },
  {
    quote:
      "Private, calm, and taken seriously. I finally felt like I was being matched as a person, not a profile.",
    attribution: "Anonymous",
  },
  {
    quote:
      "They listened. They were honest. And the introduction felt chosen, not generated.",
    attribution: "Anonymous",
  },
]

export function SocialProofSection() {
  return (
    <section
      id="proof"
      className="flex min-h-0 flex-col items-center justify-center bg-background px-6 py-16 md:min-h-[80svh] md:py-32"
    >
      <Reveal className="w-full max-w-2xl text-center">
        <p className="label text-foreground/50">The circle</p>
        <p className="mt-8 text-[15px] leading-[1.85] text-foreground/60 md:text-[17px]">
          40+ singles in our private network · NYC-based · Every introduction personally curated
        </p>
      </Reveal>

      <div className="mt-12 flex w-full max-w-2xl flex-col gap-10 md:mt-16 md:gap-14">
        {stories.map((story, i) => (
          <Reveal key={story.attribution + i} delay={i * 80} className="text-center">
            <blockquote className="mx-auto max-w-lg text-[17px] leading-[1.85] text-foreground/75 md:text-[19px]">
              “{story.quote}”
            </blockquote>
            <p className="label mt-5 text-foreground/40">{story.attribution}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
