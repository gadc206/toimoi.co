import crypto from "crypto";

import { prisma } from "@/lib/db";
import { sendWhatsAppAndLog } from "@/lib/sms/send";
import { normalizeReferralCode } from "@/lib/toimo/referral-message";
import type { Person } from "@/lib/types";

export { normalizeReferralCode, referralJoinMessage } from "@/lib/toimo/referral-message";

export const REFERRAL_THRESHOLD = 5;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function siteBaseUrl(): string {
  return (
    process.env.PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://www.toimoi.co"
  );
}

export function generateReferralCode(): string {
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += CODE_ALPHABET[crypto.randomInt(0, CODE_ALPHABET.length)];
  }
  return `TM-${suffix}`;
}

export function parseReferralCode(text: string): string | null {
  return normalizeReferralCode(text);
}

export function referralShareUrl(code: string): string {
  return `${siteBaseUrl()}/?ref=${encodeURIComponent(code)}`;
}

export async function ensureReferralCode(person: Person): Promise<Person> {
  if (person.referralCode) return person;

  for (let attempt = 0; attempt < 6; attempt++) {
    const referralCode = generateReferralCode();
    try {
      return (await prisma.person.update({
        where: { id: person.id },
        data: { referralCode },
      })) as Person;
    } catch (error) {
      const duplicate =
        error instanceof Error &&
        /unique|duplicate/i.test(error.message);
      if (!duplicate || attempt === 5) throw error;
    }
  }

  return person;
}

export async function attributeReferral(
  person: Person,
  inboundText: string,
): Promise<Person> {
  if (person.referredById) return person;

  const code = parseReferralCode(inboundText);
  if (!code) return person;

  const referrer = (await prisma.person.findUnique({
    where: { referralCode: code },
  })) as Person | null;

  if (!referrer || referrer.id === person.id) return person;

  const updated = (await prisma.person.update({
    where: { id: person.id },
    data: { referredById: referrer.id },
  })) as Person;

  await creditReferrer(referrer);
  return updated;
}

async function creditReferrer(referrer: Person) {
  const nextCount = (referrer.referralCount ?? 0) + 1;
  const crossedThreshold =
    nextCount >= REFERRAL_THRESHOLD &&
    Math.floor((referrer.referralCount ?? 0) / REFERRAL_THRESHOLD) <
      Math.floor(nextCount / REFERRAL_THRESHOLD);

  const updated = (await prisma.person.update({
    where: { id: referrer.id },
    data: {
      referralCount: nextCount,
      ...(crossedThreshold
        ? {
            listPriority: (referrer.listPriority ?? 0) + 1,
            listBoostedAt: new Date(),
          }
        : {}),
    },
  })) as Person;

  const shareUrl = updated.referralCode
    ? referralShareUrl(updated.referralCode)
    : siteBaseUrl();

  const body = crossedThreshold
    ? `You've referred ${nextCount} people — you've moved up on our list ❤️`
    : `Someone just joined through you. That's ${nextCount} of ${REFERRAL_THRESHOLD}. Share your link to move up our list:\n${shareUrl}`;

  try {
    await sendWhatsAppAndLog(updated.id, updated.phone, [body]);
  } catch (error) {
    console.error("referral notify failed", error);
  }
}
