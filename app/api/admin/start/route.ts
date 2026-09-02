import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getOrCreatePerson, openingBodies } from "@/lib/toimo/engine";
import { sendWhatsAppAndLog } from "@/lib/sms/send";
import { prisma } from "@/lib/db";
import { toE164 } from "@/lib/whatsapp/phone";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phone } = (await req.json()) as { phone?: string };
  if (!phone) {
    return NextResponse.json({ error: "Phone required" }, { status: 400 });
  }

  const normalized = toE164(phone);
  const person = await getOrCreatePerson(normalized);

  await prisma.person.update({
    where: { id: person.id },
    data: {
      status: person.status === "complete" ? person.status : "in_progress",
      currentStep: person.status === "complete" ? person.currentStep : "opening",
    },
  });

  const bodies = openingBodies();
  try {
    await sendWhatsAppAndLog(person.id, normalized, bodies);
  } catch (err) {
    for (const body of bodies) {
      await prisma.message.create({
        data: { personId: person.id, direction: "outbound", body },
      });
    }
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to send WhatsApp message",
        personId: person.id,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, personId: person.id, phone: normalized });
}
