import { prisma } from "@/lib/db";
import {
  CONSULTATION_CHECKOUT_HOLD_MS,
  isActiveConsultationReservation,
} from "@/lib/consultation";

export async function releaseExpiredConsultationHolds(now = new Date()) {
  const cutoff = new Date(now.getTime() - CONSULTATION_CHECKOUT_HOLD_MS);
  await prisma.person.updateMany({
    where: {
      consultationAt: { not: null },
      consultationPaidAt: null,
      isClient: false,
      updatedAt: { lt: cutoff },
    },
    data: {
      consultationAt: null,
      consultationCheckoutUrl: null,
      stripeCheckoutSessionId: null,
    },
  });
}

export async function reservedConsultationTimes(
  range: { gte: Date; lte: Date },
  now = new Date(),
) {
  await releaseExpiredConsultationHolds(now);
  const people = await prisma.person.findMany({
    where: {
      OR: [{ consultationAt: range }, { discoveryAt: range }],
    },
    select: {
      consultationAt: true,
      discoveryAt: true,
      consultationPaidAt: true,
      isClient: true,
      updatedAt: true,
    },
  });
  const times = new Set<string>();
  for (const person of people) {
    if (person.consultationAt && isActiveConsultationReservation(person, now)) {
      times.add(person.consultationAt.toISOString());
    }
    if (person.discoveryAt) times.add(person.discoveryAt.toISOString());
  }
  return [...times];
}

export async function isConsultationSlotTaken(
  slot: Date,
  exceptPersonId?: string,
  now = new Date(),
) {
  await releaseExpiredConsultationHolds(now);
  const people = await prisma.person.findMany({
    where: {
      OR: [{ consultationAt: slot }, { discoveryAt: slot }],
      ...(exceptPersonId ? { id: { not: exceptPersonId } } : {}),
    },
    select: {
      consultationAt: true,
      discoveryAt: true,
      consultationPaidAt: true,
      isClient: true,
      updatedAt: true,
    },
  });
  return people.some((person) => {
    if (person.discoveryAt?.getTime() === slot.getTime()) return true;
    return (
      person.consultationAt?.getTime() === slot.getTime() &&
      isActiveConsultationReservation(person, now)
    );
  });
}

export async function releaseUnpaidCheckoutHold(args: {
  sessionId: string;
  personId?: string;
}) {
  await prisma.person.updateMany({
    where: {
      stripeCheckoutSessionId: args.sessionId,
      consultationPaidAt: null,
      isClient: false,
      ...(args.personId ? { id: args.personId } : {}),
    },
    data: {
      consultationAt: null,
      consultationCheckoutUrl: null,
      stripeCheckoutSessionId: null,
    },
  });
}
