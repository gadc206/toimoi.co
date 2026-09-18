import { createHash, randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getBookingService } from "@/lib/booking";
import { isBookableConsultationSlot } from "@/lib/consultation";
import { createConsultationCheckout } from "@/lib/stripe";
import { getOrCreatePerson } from "@/lib/toimo/engine";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  consultationAt: z.string().datetime(),
  service: z.enum(["consultation", "coaching"]).optional(),
});

function bookingPhoneFromEmail(email: string) {
  const digest = createHash("sha1")
    .update(`toimoi-consult:${email.trim().toLowerCase()}`)
    .digest("hex");
  const digits = digest.replace(/\D/g, "").padEnd(10, "0").slice(0, 10);
  return `+1${digits}`;
}

async function findOrCreateGuest(name: string, email: string, serviceId: "consultation" | "coaching") {
  const existing = await prisma.person.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (existing) {
    return prisma.person.update({
      where: { id: existing.id },
      data: {
        firstName: existing.firstName || name.split(/\s+/)[0],
        email,
        isClient: serviceId === "consultation" ? true : existing.isClient,
        howHeard: existing.howHeard || "Website",
      },
    });
  }

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const phone =
      attempt === 0 ? bookingPhoneFromEmail(email) : `+1555${String(randomInt(0, 10_000_000)).padStart(7, "0")}`;
    const taken = await prisma.person.findUnique({ where: { phone } });
    if (taken) continue;
    const person = await getOrCreatePerson(phone);
    return prisma.person.update({
      where: { id: person.id },
      data: {
        firstName: name.split(/\s+/)[0],
        email,
        isClient: serviceId === "consultation",
        howHeard: "Website",
      },
    });
  }

  throw new Error("Could not save this booking.");
}

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Name, email, and a time are required." }, { status: 400 });
  }

  const consultationAt = new Date(parsed.data.consultationAt);
  if (!isBookableConsultationSlot(consultationAt)) {
    return NextResponse.json({ error: "That time is not available." }, { status: 400 });
  }

  const taken = await prisma.person.findFirst({
    where: { consultationAt },
    select: { id: true },
  });
  if (taken) {
    return NextResponse.json({ error: "That time was just taken. Please pick another." }, { status: 409 });
  }

  try {
    const service = getBookingService(parsed.data.service);
    const person = await findOrCreateGuest(parsed.data.name, parsed.data.email, service.id);
    const session = await createConsultationCheckout({
      personId: person.id,
      email: parsed.data.email,
      name: parsed.data.name,
      consultationAt,
      service: service.id,
    });
    await prisma.person.update({
      where: { id: person.id },
      data: {
        consultationAt,
        isClient: service.id === "consultation" ? true : person.isClient,
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
