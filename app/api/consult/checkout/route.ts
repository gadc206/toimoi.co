import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findOrCreateBookingGuest } from "@/lib/booking-guest";
import { getBookingService } from "@/lib/booking";
import { assignHostForSlot, getFounderAvailability, isBookableSlot } from "@/lib/consultation-hours";
import { isConsultationSlotTaken } from "@/lib/consultation-reservations";
import { prisma } from "@/lib/db";
import { createConsultationCheckout } from "@/lib/stripe";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  consultationAt: z.string().datetime(),
  service: z.enum(["consultation", "coaching"]).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Name, email, and a time are required." }, { status: 400 });
  }

  const consultationAt = new Date(parsed.data.consultationAt);
  const availability = await getFounderAvailability();
  if (!isBookableSlot(consultationAt, availability)) {
    return NextResponse.json({ error: "That time is not available." }, { status: 400 });
  }

  if (await isConsultationSlotTaken(consultationAt)) {
    return NextResponse.json({ error: "That time was just taken. Please pick another." }, { status: 409 });
  }

  try {
    const service = getBookingService(parsed.data.service);
    const person = await findOrCreateBookingGuest(parsed.data.name, parsed.data.email);
    const host = await assignHostForSlot(consultationAt, availability);
    if (
      person.consultationPaidAt &&
      person.consultationAt &&
      person.consultationAt.getTime() > Date.now()
    ) {
      return NextResponse.json(
        { error: "You already have a confirmed consultation. Email us if you need to change it." },
        { status: 409 },
      );
    }
    if (await isConsultationSlotTaken(consultationAt, person.id)) {
      return NextResponse.json({ error: "That time was just taken. Please pick another." }, { status: 409 });
    }
    const session = await createConsultationCheckout({
      personId: person.id,
      email: parsed.data.email,
      name: parsed.data.name,
      consultationAt,
      service: service.id,
      host,
    });
    await prisma.person.update({
      where: { id: person.id },
      data: {
        consultationAt,
        consultationHost: host || null,
        howHeard: person.howHeard || `Website · ${service.title}`,
        consultationCheckoutUrl: session.url,
        stripeCheckoutSessionId: session.id,
        consultationReminderSentAt: null,
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not start checkout." },
      { status: 502 },
    );
  }
}
