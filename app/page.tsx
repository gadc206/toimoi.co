import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { FeelingSection } from "@/components/feeling-section"
import { WhatWeDo } from "@/components/what-we-do"
import { TrustSection } from "@/components/trust-section"
import { AboutSection } from "@/components/about-section"
import { ServicesSection } from "@/components/services-section"
import { ReferralSection } from "@/components/referral-section"
import { JoinDatabaseSection } from "@/components/join-database-section"
import { ClosingSection } from "@/components/closing-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <FeelingSection />
      <WhatWeDo />
      <TrustSection />
      <AboutSection />
      <ServicesSection />
      <ReferralSection />
      <ClosingSection />
      <JoinDatabaseSection />
      <Footer />
    </main>
  )
}
