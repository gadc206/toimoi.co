"use client"

import { useState } from "react"
import { SiteButton } from "@/components/site-button"

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  serviceType: "discovery" | "consultation" | "coaching" | "signature" | "referral" | "journey" | "contact"
}

const serviceInfo = {
  discovery: {
    title: "Discovery Call",
    subtitle: "A 15-minute conversation to see if we are the right fit for each other.",
  },
  consultation: {
    title: "Personal Consultation",
    subtitle: "A deeply personal meeting where we take the time to truly understand who you are.",
  },
  coaching: {
    title: "Clarity & Connection Session",
    subtitle: "",
  },
  signature: {
    title: "The Signature Experience",
    subtitle: "Begin your bespoke six-month journey.",
  },
  referral: {
    title: "Referral Privilege",
    subtitle: "",
  },
  journey: {
    title: "Start Your Journey",
    subtitle: "",
  },
  contact: {
    title: "Contact Us",
    subtitle: "",
  },
}

export function ContactModal({ isOpen, onClose, serviceType }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!isOpen) return null

  const info = serviceInfo[serviceType]
  const isCoaching = serviceType === "coaching"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/send-inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          serviceType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send")
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error("Error sending inquiry:", error)
      alert("There was an error sending your inquiry. Please try again or email us directly at toimoinow@gmail.com")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsSubmitted(false)
    setFormData({ name: "", email: "", phone: "", message: "" })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-foreground/40"
        onClick={handleClose}
      />

      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-background px-8 py-12 sm:px-14 sm:py-16">
        <button
          onClick={handleClose}
          className="label absolute top-8 right-8 text-foreground/40 transition-colors hover:text-foreground"
        >
          Close
        </button>

        {isSubmitted ? (
          <div className="text-center py-12">
            <h3 className="display mb-4 text-3xl text-foreground md:text-4xl">
              Thank You
            </h3>
            <p className="text-muted-foreground mb-8">
              We have received your inquiry and will be in touch soon.
            </p>
            <div className="flex justify-center">
              <SiteButton variant="solid" onClick={handleClose}>
                Close
              </SiteButton>
            </div>
          </div>
        ) : (
          <>
            <h3 className="display mb-2 text-3xl text-foreground md:text-4xl">
              {info.title}
            </h3>
            
            {serviceType === "contact" ? (
              <div className="mb-8">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  We would love to hear from you.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Whether you are interested in matchmaking, relationship guidance, a personal consultation, or simply want to learn more about our process, feel free to reach out.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  Every conversation is completely private, thoughtful, and approached without judgment.
                </p>
                
                <p className="text-foreground leading-relaxed mb-2">
                  Email us at:
                </p>
                <a 
                  href="mailto:toimoinow@gmail.com?subject=Inquiry%20from%20ToiMoi%20Website" 
                  className="text-foreground font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
                >
                  toimoinow@gmail.com
                </a>
                <p className="text-muted-foreground mt-6 italic">
                  We look forward to connecting with you.
                </p>
              </div>
            ) : serviceType === "journey" ? (
              <div className="mb-8">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Want to meet with Noga and Vanessa?
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Email us and we will guide you from there.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  Leave any worries behind. Sometimes all it takes is one honest conversation to change everything.
                </p>
                
                <a 
                  href="mailto:toimoinow@gmail.com?subject=Start%20My%20Journey" 
                  className="text-foreground font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
                >
                  toimoinow@gmail.com
                </a>
              </div>
            ) : serviceType === "referral" ? (
              <div className="mb-8">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  At ToiMoi, some of the most meaningful connections begin through people who genuinely care. If you know someone who may be ready for a deeper relationship journey, we would be honored to welcome them into our circle.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  When you introduce someone to us, and we begin working with them either as a client or through a curated introduction, you will receive a complimentary 30 minute private guidance session as our way of saying thank you.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  This session can be used for relationship clarity, dating guidance, communication insight, or simply to better understand your own patterns and what you are looking for.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  Because meaningful connections deserve to be noticed, honored, and celebrated.
                </p>
                
                <p className="text-foreground leading-relaxed mb-2">
                  To refer someone, please email us at:
                </p>
                <a 
                  href="mailto:toimoinow@gmail.com?subject=Referral%20for%20ToiMoi" 
                  className="text-foreground font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
                >
                  toimoinow@gmail.com
                </a>
                <p className="text-muted-foreground mt-6 text-sm">
                  Please include their name, contact information, and a few words about why you feel they may be a good fit for ToiMoi.
                </p>
              </div>
            ) : serviceType === "discovery" ? (
              <div className="mb-8">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  A private 15 minute conversation designed to help us get to know each other and explore whether ToiMoi is the right fit for your journey.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  This is not a sales call or a rushed conversation. It is an honest first connection where we take the time to understand what you are looking for, answer your questions, and share how our process works.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  No pressure. No commitment. Just a thoughtful introduction.
                </p>
                
                <p className="text-foreground leading-relaxed mb-2">
                  To schedule your Discovery Call, please email us at:
                </p>
                <a 
                  href="mailto:toimoinow@gmail.com?subject=Discovery%20Call%20Request" 
                  className="text-foreground font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
                >
                  toimoinow@gmail.com
                </a>
              </div>
            ) : serviceType === "consultation" ? (
              <div className="mb-8">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  One hour, in person. We sit with your story and what you are looking for.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  Private, unhurried, and without pressure.
                </p>
                <p className="text-foreground leading-relaxed mb-2">
                  To schedule, email:
                </p>
                <a
                  href="mailto:toimoinow@gmail.com?subject=Personal%20Consultation%20Request"
                  className="text-foreground font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
                >
                  toimoinow@gmail.com
                </a>
              </div>
            ) : isCoaching ? (
              <div className="mb-8">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  A personalized one on one experience designed to help you gain clarity, strengthen your confidence, refine the way you communicate, and better understand the relationship patterns that may be holding you back.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Whether you are navigating modern dating, struggling with emotional patterns, feeling disconnected, recovering from past relationships, or simply looking for honest guidance, these sessions are designed to help you approach relationships with greater self awareness, confidence, and authenticity.
                </p>
                
                <p className="text-foreground font-medium mb-3">Topics may include:</p>
                <ul className="text-muted-foreground space-y-1 mb-6">
                  <li>• Dating & relationship clarity</li>
                  <li>• Communication & confidence</li>
                  <li>• Emotional availability</li>
                  <li>• Relationship patterns</li>
                  <li>• Masculine & feminine dynamics</li>
                  <li>• Post date insight & guidance</li>
                  <li>• Understanding attraction & compatibility</li>
                  <li>• Navigating modern dating</li>
                </ul>
                
                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  Every conversation is completely private, personalized, and approached without judgment.
                </p>
                
                <p className="text-foreground leading-relaxed mb-2">
                  To schedule your session, please email us at:
                </p>
                <a 
                  href="mailto:toimoinow@gmail.com?subject=Clarity%20%26%20Connection%20Session%20Request" 
                  className="text-foreground font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
                >
                  toimoinow@gmail.com
                </a>
                <p className="text-muted-foreground mt-6 italic">
                  We look forward to connecting with you.
                </p>
              </div>
            ) : (
              <>
                {info.subtitle && (
                  <p className="text-muted-foreground mb-8">{info.subtitle}</p>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm tracking-wide text-foreground mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border-0 border-b border-foreground/20 bg-transparent py-3 text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-foreground"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm tracking-wide text-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border-0 border-b border-foreground/20 bg-transparent py-3 text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-foreground"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm tracking-wide text-foreground mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border-0 border-b border-foreground/20 bg-transparent py-3 text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-foreground"
                      placeholder="Your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm tracking-wide text-foreground mb-2">
                      Message <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full resize-none border-0 border-b border-foreground/20 bg-transparent py-3 text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-foreground"
                      placeholder="Tell us a little about yourself or what you're looking for..."
                    />
                  </div>

                  <SiteButton
                    type="submit"
                    variant="solid"
                    size="block"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Inquiry"}
                  </SiteButton>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
