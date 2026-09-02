import { Reveal } from "@/components/reveal"

const steps = [
  {
    n: "01",
    title: "Begin quietly.",
    body: "Join our private database. We reach you on WhatsApp. Nothing is posted, and you are not on an app.",
  },
  {
    n: "02",
    title: "Speak as you are.",
    body: "We ask a few questions over text, one at a time. You answer in your own words. That is how we get to know you.",
  },
  {
    n: "03",
    title: "Then we choose.",
    body: "Noga and Vanessa read what you shared and introduce you to someone who fits. The match comes from your answers, not from photos.",
  },
]

export function HowItWorks() {
  return (
    <section
      id="approach"
      className="flex min-h-[100svh] flex-col items-center justify-center bg-background px-6 py-32"
    >
      <div id="join" className="sr-only" />
      <Reveal className="w-full max-w-xl text-center">
        <p className="label text-foreground/40">The approach</p>
        <h2 className="display mt-8 text-[clamp(2rem,4.5vw,3.8rem)]">
          A different kind of matching.
        </h2>
      </Reveal>

      <div className="mt-24 flex w-full max-w-xl flex-col gap-16">
        {steps.map((step, i) => (
          <Reveal key={step.n} delay={i * 90} className="text-center">
            <p className="label text-foreground/35">{step.n}</p>
            <h3 className="display mt-4 text-3xl md:text-4xl">{step.title}</h3>
            <p className="mx-auto mt-4 max-w-sm text-[15px] leading-[1.85] text-foreground/55">
              {step.body}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
