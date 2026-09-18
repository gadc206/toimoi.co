import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendWhatsAppAndLog } from "@/lib/sms/send";

const schema = z.object({
  body: z.string().trim().min(1).max(1500),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Write a message first." }, { status: 400 });
  }
  const { id } = await params;
  const person = await prisma.person.findUnique({ where: { id } });
  if (!person) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await sendWhatsAppAndLog(person.id, person.phone, [parsed.data.body]);
  return NextResponse.json({ ok: true });
}
