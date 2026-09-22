import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/db";
import { getOrCreatePerson } from "@/lib/toimo/engine";

function bookingPhoneFromEmail(email: string) {
  const digest = createHash("sha1")
    .update(`toimoi-consult:${email.trim().toLowerCase()}`)
    .digest("hex");
  const digits = digest.replace(/\D/g, "").padEnd(10, "0").slice(0, 10);
  return `+1${digits}`;
}

export async function findOrCreateBookingGuest(name: string, email: string) {
  const existing = await prisma.person.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (existing) {
    return prisma.person.update({
      where: { id: existing.id },
      data: {
        firstName: existing.firstName || name.split(/\s+/)[0],
        email,
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
        howHeard: "Website",
      },
    });
  }

  throw new Error("Could not save this booking.");
}
