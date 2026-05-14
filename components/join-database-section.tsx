"use client"

import Image from "next/image"
import { useState } from "react"

export function JoinDatabaseSection() {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    familyName: "",
    dateOfBirth: "",
    sex: "",
    email: "",
    phone: "",
    bio: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

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

      if (!response.ok) {
        throw new Error("Failed to submit")
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting form:", error)
      alert(
        "There was an error submitting your information. Please try again or email toimoinow@gmail.com."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  return (
    <section id="join" className="py-24 md:py-32 px-6 relative overflow-hidden">
      {/* Full crystal background like hero */}
      <div className="absolute inset-0">
        <Image
          src="/images/crystal-bg-2.jpg"
          alt=""
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background/60" />
      </div>
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-6">
          Add Yourself to Our Database
        </h2>

        {!isOpen ? (
          <>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              Join our private singles database and let us help guide you toward the right match.
            </p>
            
            <button
              onClick={() => setIsOpen(true)}
              className="inline-block px-8 py-4 border border-foreground/20 text-foreground text-sm tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-500"
            >
              Click Here to Join
            </button>
          </>
        ) : isSubmitted ? (
          <div className="text-center py-12">
            <p className="font-serif text-2xl text-foreground mb-4">Thank you</p>
            <p className="text-lg text-muted-foreground">
              Your information has been received. We will be in touch soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="text-left space-y-6 mt-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-foreground/50 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Family Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.familyName}
                  onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-foreground/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-foreground/50 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Sex
                </label>
                <select
                  required
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-foreground/50 transition-colors"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-foreground/50 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-foreground/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                A Short Bio About Yourself
              </label>
              <textarea
                required
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-foreground/50 transition-colors resize-none"
                placeholder="Tell us a bit about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Add a 30 Second Video or Picture (Optional)
              </label>
              <p className="text-sm text-muted-foreground/70 mb-3">
                This helps us get a better sense of who you are.
              </p>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:border file:border-border file:bg-background file:text-foreground file:text-sm file:cursor-pointer hover:file:bg-secondary transition-colors"
              />
              {file && (
                <p className="mt-2 text-sm text-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <p className="text-sm text-muted-foreground/80 italic leading-relaxed">
              Your information will stay private and will only be used to help us understand you and guide you toward the right match.
            </p>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-10 py-4 bg-foreground text-background text-sm tracking-widest uppercase hover:bg-foreground/90 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
