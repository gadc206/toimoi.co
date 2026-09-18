import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendToimoiEmail } from "@/lib/email";

const schema = z.object({
  to: z.string().trim().email().optional(),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(8000),
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
    return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
  }
  const { id } = await params;
  const person = await prisma.person.findUnique({ where: { id } });
  if (!person) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const to = parsed.data.to || person.email;
  if (!to) {
    return NextResponse.json({ error: "Add an email address first." }, { status: 400 });
  }
  try {
    await sendToimoiEmail({
      to,
      subject: parsed.data.subject,
      text: parsed.data.body,
    });
    if (!person.email) {
      await prisma.person.update({
        where: { id },
        data: { email: to },
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not send email." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
