import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ServiceCard } from "@/components/service-card"
import { ReferralSection } from "@/components/referral-section"
import { Footer } from "@/components/footer"

const services = [
  {
    title: "Discovery Call",
    description: "A 15-minute conversation to see if we are the right fit for each other. No pressure. No commitment. Just an honest first connection.",
    price: "Complimentary",
    cta: "Book Your Free Call",
    href: "#discovery"
  },
  {
    title: "Personal Consultation",
    description: "A deeply personal in-person meeting where we take the time to truly understand who you are, what you have been through, and what you are genuinely looking for. This is where your journey begins.",
    price: "One Hour — $350",
    cta: "Book Your Consultation",
    href: "#consultation"
  },
  {
    title: "Private Coaching Session",
    description: "A one-on-one session designed to elevate your confidence, refine how you communicate, and help you express your truest self with ease and authenticity. Because how you show up changes everything.",
    price: "$500",
    cta: "Book Your Session",
    href: "#coaching"
  },
  {
    title: "The Signature Experience",
    description: "Our most intimate and dedicated offering. A fully bespoke six-month journey built entirely around you — your story, your values, and your vision for love.",
    details: [
      "Every introduction is carefully considered.",
      "Every step is personally guided.",
      "Every conversation is held with complete discretion and care."
    ],
    includes: "Includes coaching and Personal Image Transformation. Refine your presence in a way that feels natural, elevated, and completely true to you.",
    note: "We do not offer this to everyone. We offer it to those who are truly ready.",
    price: "Pricing is discussed privately following your in-person consultation, because no two journeys are the same.",
    cta: "Begin Your Journey",
    href: "#signature",
    featured: true
  }
]

export default function WorkWithUsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      
      <section className="px-6 md:px-12 lg:px-24 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {services.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>
      </section>

      <ReferralSection />
      <Footer />
    </main>
  )
}
