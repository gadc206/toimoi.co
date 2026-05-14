"use client"

import { useEffect, useState } from "react"

import { SiteButton } from "@/components/site-button"

type JoinDatabaseModalProps = {
  isOpen: boolean
  onClose: () => void
}

const initialForm = {
  firstName: "",
  familyName: "",
  dateOfBirth: "",
  sex: "",
  email: "",
  phone: "",
  bio: "",
}

export function JoinDatabaseModal({ isOpen, onClose }: JoinDatabaseModalProps) {
  const [formData, setFormData] = useState(initialForm)
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  const handleClose = () => {
    setFormData(initialForm)
    setFile(null)
    setIsSubmitted(false)
    setIsSubmitting(false)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submitData = new FormData()
      submitData.append("name", formData.firstName)
      submitData.append("familyName", formData.familyName)
      submitData.append("dateOfBirth", formData.dateOfBirth)
      submitData.append("sex", formData.sex)
      submitData.append("email", formData.email)
      submitData.append("phone", formData.phone)
      submitData.append("bio", formData.bio)
      if (file) {
        submitData.append("media", file)
      }

      const response = await fetch("/api/submit-to-sheets", {
        method: "POST",
        body: submitData,
      })

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string
        details?: string
      }

      if (!response.ok) {
        const detail =
          typeof payload.details === "string"
            ? payload.details
            : typeof payload.error === "string"
              ? payload.error
              : "Request failed"
        throw new Error(detail)
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting form:", error)
      const message =
        error instanceof Error ? error.message : "Something went wrong."
      alert(
        `${message}\n\nIf this persists, email toimoinow@gmail.com.`,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />

      <div
        className="relative max-h-[min(90dvh,900px)] w-full max-w-2xl overflow-y-auto bg-background p-6 shadow-2xl md:p-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-db-title"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {isSubmitted ? (
          <div className="py-10 text-center">
            <p className="mb-3 font-serif text-2xl text-foreground">Thank you</p>
            <p className="mb-8 text-lg text-muted-foreground">
              Your information has been received. We will be in touch soon.
            </p>
            <SiteButton variant="solid" onClick={handleClose}>
              Close
            </SiteButton>
          </div>
        ) : (
          <>
            <h3
              id="join-db-title"
              className="mb-2 pr-10 font-serif text-2xl font-light text-foreground md:text-3xl"
            >
              Join our private database
            </h3>
            <p className="mb-8 text-sm text-muted-foreground leading-relaxed">
              Complete the application below. Your details stay confidential and are used only to
              understand you and guide you toward the right match.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full border border-border bg-background px-4 py-3 text-foreground transition-colors focus:border-foreground/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">Family name</label>
                  <input
                    type="text"
                    required
                    value={formData.familyName}
                    onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                    className="w-full border border-border bg-background px-4 py-3 text-foreground transition-colors focus:border-foreground/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">Date of birth</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full border border-border bg-background px-4 py-3 text-foreground transition-colors focus:border-foreground/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">Sex</label>
                  <select
                    required
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    className="w-full border border-border bg-background px-4 py-3 text-foreground transition-colors focus:border-foreground/50 focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-border bg-background px-4 py-3 text-foreground transition-colors focus:border-foreground/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-border bg-background px-4 py-3 text-foreground transition-colors focus:border-foreground/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted-foreground">
                  Short bio about yourself
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full resize-none border border-border bg-background px-4 py-3 text-foreground transition-colors focus:border-foreground/50 focus:outline-none"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted-foreground">
                  Photo or short video (optional)
                </label>
                <p className="mb-3 text-xs text-muted-foreground/80">
                  Helps us get a sense of who you are.
                </p>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-muted-foreground file:mr-4 file:cursor-pointer file:border file:border-border file:bg-background file:px-4 file:py-2 file:text-sm file:text-foreground transition-colors hover:file:bg-secondary"
                />
                {file ? (
                  <p className="mt-2 text-sm text-foreground">Selected: {file.name}</p>
                ) : null}
              </div>

              <p className="text-xs italic leading-relaxed text-muted-foreground/80">
                Your information stays private and is only used for matchmaking guidance.
              </p>

              <div className="flex justify-center pt-2 md:justify-start">
                <SiteButton type="submit" variant="solid" size="block" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit application"}
                </SiteButton>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
