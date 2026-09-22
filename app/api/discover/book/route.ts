import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findOrCreateBookingGuest } from "@/lib/booking-guest";
import {
  formatConsultationTime,
  founderName,
  googleCalendarConsultUrl,
} from "@/lib/consultation";
import { assignHostForSlot, getFounderAvailability, isBookableSlot } from "@/lib/consultation-hours";
import { isConsultationSlotTaken } from "@/lib/consultation-reservations";
import { prisma } from "@/lib/db";
import { notifyConsultationScheduled, sendToimoiEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  at: z.string().datetime(),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Name, email, and a time are required." }, { status: 400 });
  }

  const when = new Date(parsed.data.at);
  const availability = await getFounderAvailability();
  if (!isBookableSlot(when, availability)) {
    return NextResponse.json({ error: "That time is not available." }, { status: 400 });
  }
  if (await isConsultationSlotTaken(when)) {
    return NextResponse.json({ error: "That time was just taken. Please pick another." }, { status: 409 });
  }

  try {
    const person = await findOrCreateBookingGuest(parsed.data.name, parsed.data.email);
    if (person.discoveryAt && person.discoveryAt.getTime() > Date.now()) {
      return NextResponse.json(
        { error: "You already have a discovery call booked. Email us if you need to change it." },
        { status: 409 },
      );
    }
    if (await isConsultationSlotTaken(when, person.id)) {
      return NextResponse.json({ error: "That time was just taken. Please pick another." }, { status: 409 });
    }
    const host = await assignHostForSlot(when, availability);
    await prisma.person.update({
      where: { id: person.id },
      data: {
        discoveryAt: when,
        discoveryHost: host || null,
        howHeard: person.howHeard || "Website · Discovery Call",
      },
    });
    const whenLabel = formatConsultationTime(when);
    const calendarUrl = googleCalendarConsultUrl(when, {
      title: "ToiMoi discovery call",
      details: "A complimentary 15-minute discovery call with ToiMoi.",
      durationMinutes: 15,
    });
    await notifyConsultationScheduled({
      name: parsed.data.name,
      email: parsed.data.email,
      when,
      serviceTitle: host ? `Discovery call with ${founderName(host)}` : "Discovery call",
      source: "Website",
      durationMinutes: 15,
    });
    try {
      await sendToimoiEmail({
        to: parsed.data.email,
        subject: "Your ToiMoi discovery call is booked",
        text: `Hi ${parsed.data.name.split(/\s+/)[0]},\n\nYour discovery call is booked for ${whenLabel}.\n\nAdd it to Google Calendar:\n${calendarUrl}\n\nWith love,\nToiMoi`,
      });
    } catch (error) {
      console.error("discovery guest email failed", error);
    }
    return NextResponse.json({ ok: true, when: when.toISOString(), host: host || null });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not book this time." },
      { status: 502 },
    );
  }
}
