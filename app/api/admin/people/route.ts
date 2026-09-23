import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOrCreatePerson, openingBodies } from "@/lib/toimo/engine";
import { saveUploadedPhoto } from "@/lib/sms/media";
import { sendWhatsAppAndLog } from "@/lib/sms/send";
import { toE164 } from "@/lib/whatsapp/phone";
import { isImageContentType } from "@/lib/whatsapp/media";
import { notifyConsultationScheduled } from "@/lib/email";
import { createConsultationCheckout } from "@/lib/stripe";
import { creditReferrer } from "@/lib/toimo/referral";
import type { Person } from "@/lib/types";

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

const schema = z.object({
  firstName: z.string().trim().max(120).optional(),
  phone: z.string().trim().min(6),
  email: z.string().trim().email().optional().or(z.literal("")),
  howHeard: z.string().trim().max(500).optional(),
  referredById: z.string().optional(),
  isClient: z.boolean().optional(),
  consultationAt: z.string().optional(),
  sendOpening: z.boolean().optional(),
  age: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(18).max(99).optional(),
  ),
  answers: z
    .array(
      z.object({
        question: z.string().trim().min(2).max(240),
        answer: z.string().trim().max(4000),
      }),
    )
    .optional(),
});

function formBoolean(value: FormDataEntryValue | null): boolean {
  return value === "true" || value === "1" || value === "on";
}

async function readCreateRequest(request: NextRequest): Promise<{ body: unknown; photo: File | null }> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return { body: await request.json(), photo: null };
  }

  const form = await request.formData();
  const file = form.get("photo");
  let answers: unknown = [];
  const answersRaw = form.get("answers");
  if (typeof answersRaw === "string" && answersRaw.trim()) {
    try {
      answers = JSON.parse(answersRaw);
    } catch {
      answers = [];
    }
  }

  return {
    photo: file instanceof File && file.size > 0 ? file : null,
    body: {
      firstName: form.get("firstName") || undefined,
      phone: form.get("phone") || "",
      email: form.get("email") || "",
      howHeard: form.get("howHeard") || undefined,
      referredById: form.get("referredById") || undefined,
      isClient: formBoolean(form.get("isClient")),
      consultationAt: form.get("consultationAt") || undefined,
      sendOpening: formBoolean(form.get("sendOpening")),
      age: form.get("age") || undefined,
      answers,
    },
  };
}

function photoError(photo: File): string | null {
  if (!isImageContentType(photo.type) || photo.type === "application/octet-stream") {
    return "Choose an image for the photo.";
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    return "That photo is too large. Use one under 4 MB.";
  }
  return null;
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { body, photo } = await readCreateRequest(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const ageIssue = parsed.error.issues.some((issue) => issue.path[0] === "age");
    return NextResponse.json(
      { error: ageIssue ? "Age needs to be between 18 and 99." : "A valid phone number is required." },
      { status: 400 },
    );
  }

  if (photo) {
    const invalid = photoError(photo);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
  }

  const phone = toE164(parsed.data.phone);
  const existing = await prisma.person.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json(
      { error: "Someone with that phone is already in the database.", personId: existing.id },
      { status: 409 },
    );
  }

  if (parsed.data.isClient && !parsed.data.consultationAt) {
    return NextResponse.json({ error: "Clients need a consultation date and time." }, { status: 400 });
  }

  let referrer: Person | null = null;
  if (parsed.data.referredById) {
    referrer = (await prisma.person.findUnique({
      where: { id: parsed.data.referredById },
    })) as Person | null;
    if (!referrer) {
      return NextResponse.json({ error: "That referrer is not in the database." }, { status: 400 });
    }
  }

  const consultationAt = parsed.data.consultationAt ? new Date(parsed.data.consultationAt) : null;
  if (consultationAt && Number.isNaN(consultationAt.getTime())) {
    return NextResponse.json({ error: "That consultation time is not valid." }, { status: 400 });
  }

  let photoUrl: string | null = null;
  if (photo) {
    try {
      photoUrl = await saveUploadedPhoto(Buffer.from(await photo.arrayBuffer()), photo.type || null);
    } catch (error) {
      console.error("admin photo upload failed", error);
      return NextResponse.json({ error: "Could not save that photo." }, { status: 500 });
    }
  }

  const person = await getOrCreatePerson(phone);
  if (referrer && referrer.id === person.id) {
    return NextResponse.json({ error: "A person cannot refer themselves." }, { status: 400 });
  }

  let checkoutUrl: string | null = null;
  let sessionId: string | null = null;
  let warning: string | undefined;
  if (parsed.data.isClient) {
    try {
      const session = await createConsultationCheckout({
        personId: person.id,
        email: parsed.data.email || null,
        name: parsed.data.firstName || null,
        consultationAt,
      });
      checkoutUrl = session.url;
      sessionId = session.id;
    } catch (error) {
      warning = error instanceof Error ? error.message : "Saved, but the pay link could not be created.";
    }
  }

  const answers = (parsed.data.answers || []).filter((item) => item.answer);
  const heard = answers.find((item) => /heard/i.test(item.question));

  const updated = await prisma.person.update({
    where: { id: person.id },
    data: {
      firstName: parsed.data.firstName || null,
      email: parsed.data.email || null,
      age: parsed.data.age ?? null,
      ...(photoUrl ? { photoUrl } : {}),
      howHeard: parsed.data.howHeard || heard?.answer || null,
      referredById: referrer?.id || null,
      isClient: Boolean(parsed.data.isClient),
      consultationAt,
      consultationCheckoutUrl: checkoutUrl,
      stripeCheckoutSessionId: sessionId,
      status: parsed.data.sendOpening ? "in_progress" : person.status,
      currentStep: parsed.data.sendOpening ? "full_name" : person.currentStep,
    },
  });

  if (answers.length > 0) {
    await prisma.personAdminAnswer.createMany({
      data: answers.map((item) => ({
        personId: updated.id,
        questionText: item.question,
        answer: item.answer,
      })),
    });
    await Promise.all(
      answers.map((item) =>
        prisma.adminQuestion.upsert({
          where: { text: item.question },
          update: {},
          create: { text: item.question },
        }),
      ),
    );
  }

  if (referrer) {
    await creditReferrer(referrer);
  }

  if (consultationAt) {
    await notifyConsultationScheduled({
      name: updated.firstName,
      email: updated.email,
      when: consultationAt,
      source: "Admin",
    });
  }

  if (parsed.data.sendOpening) {
    try {
      await sendWhatsAppAndLog(updated.id, phone, openingBodies());
    } catch (error) {
      return NextResponse.json(
        {
          ok: true,
          personId: updated.id,
          warning: [warning, error instanceof Error ? error.message : "Saved, but WhatsApp did not send."]
            .filter(Boolean)
            .join(" "),
        },
        { status: 200 },
      );
    }
  }

  return NextResponse.json({ ok: true, personId: updated.id, warning });
}
