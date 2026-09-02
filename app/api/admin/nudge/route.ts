import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
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

  const body = `Hi${person.firstName ? ` ${person.firstName}` : ""} 😊 Just gently checking in — whenever you're ready, reply CONTINUE and we can pick up our conversation.`;
  await sendWhatsAppAndLog(person.id, person.phone, [body]);
  return NextResponse.json({ ok: true });
}
