import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { photoUploadError, uploadFromForm } from "@/lib/admin/photo-upload"
import { prisma } from "@/lib/db"
import { saveUploadedPhoto } from "@/lib/sms/media"
import { inferLookingFor, parseDateOfBirth } from "@/lib/toimo/branches"
import { getOrCreatePerson } from "@/lib/toimo/engine"
import {
  attributeReferral,
  ensureReferralCode,
  referralShareUrl,
  siteBaseUrl,
} from "@/lib/toimo/referral"
import type { Person } from "@/lib/types"
import { toE164 } from "@/lib/whatsapp/phone"

export const runtime = "nodejs"

const text = (max: number) => z.string().trim().min(1).max(max)

const schema = z.object({
  phone: z.string().trim().min(6).max(30),
  full_name: text(160),
  date_of_birth: text(40),
  gender: text(60),
  email: z.string().trim().email().max(200),
  partner_age_range: text(60),
  everyday_life: text(4000),
  religiosity: text(4000),
  partner_religiosity: text(4000),
  family_background: text(4000),
  self_description: text(4000),
  partner_qualities: text(4000),
  non_negotiables: text(4000),
  physical_type: text(4000),
  ref: z.string().trim().max(40).optional(),
})

function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status })
}

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null)
  if (!form) return fail("Something went wrong. Please try again.")

  // Honeypot: real people never see or fill this field.
  if (String(form.get("company") || "").trim()) {
    return NextResponse.json({ ok: true })
  }

  const fields = Object.fromEntries(
    Object.keys(schema.shape).map((key) => [key, form.get(key) ?? undefined]),
  )
  const parsed = schema.safeParse(fields)
  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] || "")
    if (field === "email") return fail("Please enter a valid email address.")
    if (field === "phone") return fail("Please enter your phone number with country code.")
    return fail("Please answer every question before sending.")
  }
  const data = parsed.data

  const phone = toE164(data.phone)
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    return fail("Please enter your phone number with country code (for example +1 212 555 0100).")
  }

  const dob = parseDateOfBirth(data.date_of_birth)
  if (!dob) return fail("Please enter a valid date of birth.")

  const ages = data.partner_age_range.match(/\b([1-9][0-9]?)\b/g)?.map(Number) || []
  if (ages.filter((age) => age >= 18 && age <= 99).length < 2) {
    return fail("Please give a minimum and maximum partner age, for example 27-36.")
  }

  const photo = uploadFromForm(form.get("photo"))
  if (!photo) return fail("Please add a selfie or a photo of yourself.")
  const photoError = photoUploadError(photo)
  if (photoError) return fail(photoError)

  const existing = await prisma.person.findUnique({ where: { phone } })
  if (existing?.status === "complete") {
    return fail(
      "You're already in the TOIMOI network with this phone number. A matchmaker will be in touch.",
      409,
    )
  }

  let person = await getOrCreatePerson(phone)
  if (data.ref) person = await attributeReferral(person, data.ref)

  let photoUrl: string | null = null
  try {
    photoUrl = await saveUploadedPhoto(Buffer.from(await photo.arrayBuffer()), photo.type || null)
  } catch (error) {
    console.error("join form photo upload failed", error)
    return fail("Your photo did not upload. Please try a different photo.", 502)
  }

  const answer = {
    everydayLife: data.everyday_life,
    location: data.everyday_life,
    relocationFlexibility: data.everyday_life,
    partnerAgeRange: data.partner_age_range,
    religiosity: data.religiosity,
    partnerReligiosity: data.partner_religiosity,
    familyBackground: data.family_background,
    selfDescription: data.self_description,
    partnerQualities: data.partner_qualities,
    nonNegotiables: data.non_negotiables,
    physicalAttracted: data.physical_type,
  }
  await prisma.profileAnswers.upsert({
    where: { personId: person.id },
    create: { personId: person.id, ...answer },
    update: answer,
  })

  const updated = (await prisma.person.update({
    where: { id: person.id },
    data: {
      firstName: data.full_name,
      dateOfBirth: dob.iso,
      age: dob.age,
      gender: data.gender,
      lookingFor: inferLookingFor(data.gender),
      email: data.email.toLowerCase(),
      photoUrl,
      status: "complete",
      currentStep: "complete",
      completedAt: new Date(),
      pausedAt: null,
    },
  })) as Person

  await prisma.message.create({
    data: {
      personId: updated.id,
      direction: "inbound",
      body: "[website form] Answered all intake questions on toimoi.co/join",
    },
  })

  const withCode = await ensureReferralCode(updated)
  const shareUrl = withCode.referralCode ? referralShareUrl(withCode.referralCode) : siteBaseUrl()

  return NextResponse.json({ ok: true, shareUrl })
}
