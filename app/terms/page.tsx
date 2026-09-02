import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "TOIMOI Terms and Conditions: rules for using our Jewish matchmaking intake and WhatsApp messaging services.",
  alternates: {
    canonical: "https://www.toimoi.co/terms",
  },
  openGraph: {
    title: "Terms and Conditions | ToiMoi",
    description:
      "Terms governing use of TOIMOI matchmaking intake, WhatsApp messaging, and related services.",
    url: "https://www.toimoi.co/terms",
  },
}

export default function TermsPage() {
  return (
    <LegalPage
      title="TOIMOI Terms and Conditions"
      effectiveDate="August 10, 2026"
    >
      <p>
        These Terms govern your use of TOIMOI, including WhatsApp messaging and
        related matchmaking services.
      </p>

      <section>
        <h2>1. What TOIMOI is</h2>
        <p className="mt-3">
          TOIMOI is a Jewish matchmaking intake and matchmaker-assisted service.
          Messaging may include an introduction, intake/coaching questions,
          clarifications, and occasional follow-ups. TOIMOI does not guarantee a
          match, relationship, marriage, or any particular outcome.
        </p>
      </section>

      <section>
        <h2>2. Eligibility</h2>
        <p className="mt-3">
          You must be at least 18 years old to use TOIMOI. You agree that
          information you provide is truthful to the best of your knowledge.
        </p>
      </section>

      <section>
        <h2>3. Consent to messaging</h2>
        <p className="mt-3">
          By texting START, messaging the TOIMOI WhatsApp number, or otherwise
          requesting/agreeing to be contacted, you consent to receive
          WhatsApp/text messages from TOIMOI related to matchmaking intake and
          follow-up.
        </p>
        <p className="mt-4">
          Message frequency varies. Message and data rates may apply. You can
          opt out at any time by replying STOP.
        </p>
      </section>

      <section>
        <h2>4. Acceptable use</h2>
        <p className="mt-3">You agree not to:</p>
        <ul>
          <li>Provide false or harmful information</li>
          <li>Harass or abuse matchmakers or other users</li>
          <li>Use the service for unlawful purposes</li>
          <li>Attempt to disrupt or misuse the messaging system</li>
        </ul>
      </section>

      <section>
        <h2>5. Matchmaker review</h2>
        <p className="mt-3">
          Profiles and answers may be reviewed by TOIMOI matchmakers for
          matching purposes. Suggested matches are recommendations only.
          Introductions are made by human matchmakers, not automatically by the
          system.
        </p>
      </section>

      <section>
        <h2>6. Photos and personal content</h2>
        <p className="mt-3">
          If you send a photo or personal answers, you grant TOIMOI permission
          to store and use that content solely for matchmaking and service
          operations.
        </p>
      </section>

      <section>
        <h2>7. Privacy</h2>
        <p className="mt-3">
          Our handling of personal information is described in our Privacy
          Policy:{" "}
          <Link href="/privacy">https://toimoi.co/privacy</Link>
        </p>
      </section>

      <section>
        <h2>8. No professional advice</h2>
        <p className="mt-3">
          TOIMOI provides matchmaking support and coaching-style questions. It
          is not legal, medical, psychological, rabbinic, or professional
          advice.
        </p>
      </section>

      <section>
        <h2>9. Limitation of liability</h2>
        <p className="mt-3">
          To the fullest extent permitted by law, TOIMOI and its operators are
          not liable for indirect, incidental, or consequential damages arising
          from use of the service, including dating outcomes or communications
          between users.
        </p>
      </section>

      <section>
        <h2>10. Changes</h2>
        <p className="mt-3">
          We may update these Terms from time to time. Continued use after
          updates means you accept the revised Terms.
        </p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p className="mt-3">
          Questions:{" "}
          <a href="mailto:toimoinow@gmail.com">toimoinow@gmail.com</a>
        </p>
      </section>
    </LegalPage>
  )
}
