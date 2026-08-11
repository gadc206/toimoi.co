import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "TOIMOI Privacy Policy — how we collect, use, and protect information for Jewish matchmaking intake and WhatsApp messaging.",
  alternates: {
    canonical: "https://www.toimoi.co/privacy",
  },
  openGraph: {
    title: "Privacy Policy | ToiMoi",
    description:
      "How TOIMOI collects, uses, and protects personal information for matchmaking intake and messaging.",
    url: "https://www.toimoi.co/privacy",
  },
}

export default function PrivacyPage() {
  return (
    <LegalPage title="TOIMOI Privacy Policy" effectiveDate="August 10, 2026">
      <p>
        TOIMOI (“we,” “us,” or “our”) provides Jewish matchmaking intake and
        matchmaker support through WhatsApp messaging and our related
        website/admin tools.
      </p>

      <section>
        <h2>1. Information we collect</h2>
        <p className="mt-3">We may collect:</p>
        <ul>
          <li>Phone number (WhatsApp)</li>
          <li>
            Name, email, age, gender, photos, and answers you provide during the
            TOIMOI intake conversation
          </li>
          <li>
            Message content you send us (including voice-note transcripts)
          </li>
          <li>
            Basic technical logs needed to operate messaging and the service
          </li>
        </ul>
      </section>

      <section>
        <h2>2. How we use information</h2>
        <p className="mt-3">We use this information to:</p>
        <ul>
          <li>Run the TOIMOI matchmaking intake conversation</li>
          <li>
            Help matchmakers review profiles and suggest or create matches
          </li>
          <li>
            Send service messages related to your intake and matchmaking process
          </li>
          <li>Improve and operate the TOIMOI service</li>
        </ul>
      </section>

      <section>
        <h2>3. Mobile numbers and SMS/WhatsApp messaging</h2>
        <p className="mt-3">
          We do not sell, rent, or share mobile phone numbers with third parties
          or affiliates for their marketing or promotional purposes. Mobile
          numbers are used only to provide TOIMOI messaging and matchmaking
          services.
        </p>
        <p className="mt-4">
          Message frequency varies depending on your participation in the intake
          conversation and any follow-up messages from a matchmaker. Message and
          data rates may apply.
        </p>
      </section>

      <section>
        <h2>4. Opting out</h2>
        <p className="mt-3">
          You can opt out of messages at any time by replying STOP. You may also
          reply PAUSE to temporarily pause, or START to begin again if
          available.
        </p>
      </section>

      <section>
        <h2>5. Sharing of other information</h2>
        <p className="mt-3">We may share information only with:</p>
        <ul>
          <li>
            Service providers who help us operate messaging, hosting, or
            transcription (for example Twilio and OpenAI), under agreements that
            limit use to providing those services
          </li>
          <li>
            Matchmakers working with TOIMOI for matchmaking purposes
          </li>
          <li>Legal authorities if required by law</li>
        </ul>
        <p className="mt-4">We do not sell personal information.</p>
      </section>

      <section>
        <h2>6. Data retention</h2>
        <p className="mt-3">
          We retain profile and conversation information as needed for
          matchmaking and service operations, unless you request deletion where
          legally permitted.
        </p>
      </section>

      <section>
        <h2>7. Security</h2>
        <p className="mt-3">
          We take reasonable measures to protect personal information, but no
          method of transmission or storage is 100% secure.
        </p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p className="mt-3">
          For privacy questions or requests, contact:{" "}
          <a href="mailto:toimoinow@gmail.com">toimoinow@gmail.com</a>
        </p>
      </section>

      <p>
        By using TOIMOI or messaging us, you acknowledge this Privacy Policy.
      </p>
    </LegalPage>
  )
}
