import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ManifestoSection } from "@/components/manifesto-section"
import { SocialProofSection } from "@/components/social-proof-section"
import { HowItWorks } from "@/components/how-it-works"
import { AboutSection } from "@/components/about-section"
import { ServicesSection } from "@/components/services-section"
import { ReferralSection } from "@/components/referral-section"
import { ClosingSection } from "@/components/closing-section"
import { Footer } from "@/components/footer"
import { FloatingJoinCta } from "@/components/floating-join-cta"

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="pb-24">
        <Hero />
        <ManifestoSection />
        <SocialProofSection />
        <HowItWorks />
        <AboutSection />
        <ServicesSection />
        <ReferralSection />
        <ClosingSection />
      </main>
      <Footer />
      <FloatingJoinCta />
    </>
  )
}
