import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ManifestoSection } from "@/components/manifesto-section"
import { HowItWorks } from "@/components/how-it-works"
import { AboutSection } from "@/components/about-section"
import { ServicesSection } from "@/components/services-section"
import { ReferralSection } from "@/components/referral-section"
import { ClosingSection } from "@/components/closing-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ManifestoSection />
        <HowItWorks />
        <AboutSection />
        <ServicesSection />
        <ReferralSection />
        <ClosingSection />
      </main>
      <Footer />
    </>
  )
}
