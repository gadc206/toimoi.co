"use client"

import { useState } from "react"

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  serviceType: "discovery" | "consultation" | "coaching" | "signature" | "referral"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 md:p-12 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {isSubmitted ? (
          <div className="text-center py-12">
            <h3 className="font-serif text-2xl md:text-3xl font-light text-foreground mb-4">
              Thank You
            </h3>
            <p className="text-muted-foreground mb-8">
              We have received your inquiry and will be in touch soon.
            </p>
            <button
              onClick={handleClose}
              className="px-8 py-4 bg-foreground text-background text-sm tracking-widest uppercase hover:bg-foreground/90 transition-all duration-300"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-serif text-2xl md:text-3xl font-light text-foreground mb-2">
              {info.title}
            </h3>
            
            {serviceType === "referral" ? (
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
                  href="mailto:toimoinow@gmail.com" 
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
                  href="mailto:toimoinow@gmail.com" 
                  className="text-foreground font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
                >
                  toimoinow@gmail.com
                </a>
              </div>
            ) : serviceType === "consultation" ? (
              <div className="mb-8">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  A deeply personal one on one meeting where we take the time to truly understand who you are, your life experiences, relationship history, values, lifestyle, and what you are genuinely looking for in a partner and in life.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  This is not a rushed interview or a superficial conversation. It is the foundation of our process and allows us to carefully understand your personality, emotional dynamics, communication style, and relationship goals on a much deeper level.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  During this in depth session, we explore questions that help you reflect on yourself in ways you may never have before. Together, we dig deeper into what your soul truly wants, what may be holding you back, and what kind of connection would genuinely bring you peace, growth, and fulfillment.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  This experience is designed to open your mind to a different level of self awareness, clarity, and emotional understanding.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  Each consultation lasts over an hour and is completely private, thoughtful, and approached with honesty, intuition, and without judgment.
                </p>
                <p className="text-foreground font-medium mb-6">
                  This is where your journey begins.
                </p>
                
                <p className="text-foreground leading-relaxed mb-2">
                  To schedule your Personal Consultation, please email us at:
                </p>
                <a 
                  href="mailto:toimoinow@gmail.com" 
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
                  href="mailto:toimoinow@gmail.com" 
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
                      className="w-full px-4 py-3 bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors"
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
                      className="w-full px-4 py-3 bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors"
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
                      className="w-full px-4 py-3 bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors"
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
                      className="w-full px-4 py-3 bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors resize-none"
                      placeholder="Tell us a little about yourself or what you're looking for..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-4 bg-foreground text-background text-sm tracking-widest uppercase hover:bg-foreground/90 transition-all duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Send Inquiry"}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
