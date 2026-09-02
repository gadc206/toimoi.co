"use client"

import { useEffect } from "react"

import { JoinPaths } from "@/components/join-paths"

type JoinDatabaseModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function JoinDatabaseModal({ isOpen, onClose }: JoinDatabaseModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl bg-background px-8 py-12 sm:px-14 sm:py-16">
        <button
          type="button"
          onClick={onClose}
          className="label absolute top-8 right-8 text-foreground/40 transition-colors hover:text-foreground"
        >
          Close
        </button>

        <p className="label text-foreground/40">Private list</p>
        <h2 className="display mt-4 pr-12 text-4xl text-foreground sm:text-5xl">
          Join our database
        </h2>
        <p className="mt-5 max-w-lg text-[15px] leading-[1.8] text-foreground/60">
          Choose how you are joining. We will continue with you on WhatsApp.
        </p>

        <div className="mt-10">
          <JoinPaths />
        </div>
      </div>
    </div>
  )
}
