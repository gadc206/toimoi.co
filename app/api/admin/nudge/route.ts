import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { nudgeMessage, nudgedWithinWeek } from "@/lib/nudge";
import { sendWhatsAppAndLog } from "@/lib/sms/send";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { personId } = (await req.json()) as { personId?: string };
  if (!personId) {
    return NextResponse.json({ error: "personId required" }, { status: 400 });
  }

  const person = await prisma.person.findUnique({ where: { id: personId } });
  if (!person) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (person.status === "opted_out" || person.status === "complete") {
    return NextResponse.json({ error: "Cannot nudge this person" }, { status: 400 });
  }
  if (nudgedWithinWeek(person.lastNudgedAt)) {
    return NextResponse.json(
      { error: "A nudge was already sent in the last week.", lastNudgedAt: person.lastNudgedAt },
      { status: 400 },
    );
  }

  await sendWhatsAppAndLog(person.id, person.phone, [nudgeMessage(person.firstName)]);
  const updated = await prisma.person.update({
    where: { id: personId },
    data: { lastNudgedAt: new Date() },
  });
  return NextResponse.json({ ok: true, lastNudgedAt: updated.lastNudgedAt });
}
