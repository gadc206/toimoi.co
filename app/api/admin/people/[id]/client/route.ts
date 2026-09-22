import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyConsultationScheduled } from "@/lib/email";
import { createConsultationCheckout } from "@/lib/stripe";

const schema = z.object({
  isClient: z.boolean(),
  consultationAt: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid client details." }, { status: 400 });
  }
  const { id } = await params;
  const person = await prisma.person.findUnique({ where: { id } });
  if (!person) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!parsed.data.isClient) {
    const updated = await prisma.person.update({
      where: { id },
      data: {
        isClient: false,
        consultationReminderSentAt: null,
      },
    });
    return NextResponse.json({ person: updated });
  }

  if (!parsed.data.consultationAt) {
    return NextResponse.json({ error: "Add the consultation date and time." }, { status: 400 });
  }
  const consultationAt = new Date(parsed.data.consultationAt);
  if (Number.isNaN(consultationAt.getTime())) {
    return NextResponse.json({ error: "That consultation time is not valid." }, { status: 400 });
  }

  let checkoutUrl = person.consultationCheckoutUrl;
  let sessionId = person.stripeCheckoutSessionId;
  if (!checkoutUrl) {
    try {
      const session = await createConsultationCheckout({
        personId: person.id,
        email: person.email,
        name: person.firstName,
        consultationAt,
      });
      checkoutUrl = session.url;
      sessionId = session.id;
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Could not create a pay link." },
        { status: 502 },
      );
    }
  }

  const timeChanged =
    !person.consultationAt || person.consultationAt.getTime() !== consultationAt.getTime();

  const updated = await prisma.person.update({
    where: { id },
    data: {
      isClient: true,
      consultationAt,
      consultationCheckoutUrl: checkoutUrl,
      stripeCheckoutSessionId: sessionId,
      ...(timeChanged ? { consultationReminderSentAt: null } : {}),
    },
  });
  if (timeChanged) {
    await notifyConsultationScheduled({
      name: updated.firstName,
      email: updated.email,
      when: consultationAt,
      source: "Admin",
    });
  }
  return NextResponse.json({ person: updated });
}
