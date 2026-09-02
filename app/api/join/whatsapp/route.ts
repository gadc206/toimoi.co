import { NextRequest, NextResponse } from "next/server"
import { getOrCreatePerson, openingBodies } from "@/lib/toimo/engine"
import { sendWhatsAppAndLog } from "@/lib/sms/send"
import { prisma } from "@/lib/db"
import { toE164 } from "@/lib/whatsapp/phone"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { phone?: string }
  const phone = body.phone?.trim()
  if (!phone) {
    return NextResponse.json({ error: "Phone number required" }, { status: 400 })
  }

  const normalized = toE164(phone)
  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
    return NextResponse.json(
      { error: "Please enter a valid phone number with country code (e.g. +1…)" },
      { status: 400 },
    )
  }

  const person = await getOrCreatePerson(normalized)

  await prisma.person.update({
    where: { id: person.id },
    data: {
      status: person.status === "complete" ? person.status : "in_progress",
      currentStep: person.status === "complete" ? person.currentStep : "opening",
    },
  })

  const bodies = openingBodies()
  try {
    await sendWhatsAppAndLog(person.id, normalized, bodies)
  } catch (err) {
    for (const text of bodies) {
      await prisma.message.create({
        data: { personId: person.id, direction: "outbound", body: text },
      })
    }
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not send WhatsApp yet. Try “Message us on WhatsApp” instead.",
      },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
