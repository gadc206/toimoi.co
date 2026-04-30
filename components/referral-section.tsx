import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function ReferralSection() {
  return (
    <section className="bg-card border-t border-border">
      <div className="px-6 md:px-12 lg:px-24 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-[1fr,1.5fr] gap-8 md:gap-16">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-light text-foreground">
                Referral Privilege
              </h2>
            </div>
            <div className="flex flex-col gap-6">
              <p className="text-muted-foreground leading-relaxed">
                Introduce someone to our circle, and if we begin working with them — whether as a client or through a curated introduction — you will receive a complimentary 30-minute private coaching session as our way of saying thank you.
              </p>
              <p className="text-foreground italic leading-relaxed">
                Because meaningful connections deserve to be celebrated.
              </p>
              <Link
                href="#referral"
                className="group inline-flex items-center gap-3 text-foreground hover:text-accent transition-colors mt-4"
              >
                <span className="text-sm tracking-wider uppercase">Refer Someone</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
