"use client"

import Link from "next/link"

import { GetAddedButton } from "@/components/get-added-button"
import { LogoMark } from "@/components/logo-mark"
import { Reveal } from "@/components/reveal"
import { SiteButton } from "@/components/site-button"

export function ClosingSection() {
  return (
    <section
      id="closing"
      className="flex min-h-0 flex-col items-center justify-center bg-background px-6 py-16 md:min-h-[100svh] md:py-32"
    >
      <Reveal className="flex flex-col items-center text-center">
        <p className="label text-foreground/50">When you are ready</p>
        <div className="mt-12">
          <LogoMark size="intro" state="locked" />
        </div>
        <p className="display mt-16 max-w-xl text-[clamp(2rem,4vw,3.2rem)] leading-[1.25]">
          It only takes
          <br />
          <span className="display-italic">one person</span>
          <br />
          to change everything.
        </p>
        <div className="mt-14 flex flex-col items-center gap-5">
          <GetAddedButton>Join the TOIMOI network</GetAddedButton>
          <SiteButton asChild>
            <Link href="/consult">Private Consultation</Link>
          </SiteButton>
        </div>
      </Reveal>
    </section>
  )
}
