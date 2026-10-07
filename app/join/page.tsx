import type { Metadata } from "next"
import Link from "next/link"

import { Footer } from "@/components/footer"
import { JoinForm } from "@/components/join-form"
import { LogoMark } from "@/components/logo-mark"

export const metadata: Metadata = {
  title: "Join the TOIMOI network",
  description: "Answer a few questions so a TOIMOI matchmaker can get to know you.",
  alternates: { canonical: "https://www.toimoi.co/join" },
}

export default function JoinPage() {
  return (
    <main className="min-h-screen text-foreground">
      <header className="border-b border-foreground/10 bg-background">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 sm:px-10 lg:px-14">
          <Link href="/" aria-label="TOIMOI home">
            <LogoMark size="nav" />
          </Link>
          <Link href="/" className="nav-link">
            Home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-xl px-6 py-16 sm:py-24">
        <p className="label text-foreground/50">Private list</p>
        <h1 className="display mt-4 text-4xl text-foreground md:text-6xl">Join the TOIMOI network</h1>
        <p className="mt-6 text-[17px] leading-[1.85] text-foreground/65">
          We are going to ask you 13 questions, plus a selfie at the end. Take your time and most
          importantly, be honest. There is absolutely no judgement here. We want to understand who
          YOU are and who could really be right for you.
        </p>
        <div className="mt-12">
          <JoinForm />
        </div>
      </article>

      <Footer />
    </main>
  )
}
