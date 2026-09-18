import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { bookingAmountCents, bookingAmountLabel, getBookingService } from "@/lib/booking";
import {
  CONSULTATION_DURATION_MINUTES,
  CONSULTATION_TIME_ZONE,
  listConsultationDays,
  slotsForConsultationDay,
} from "@/lib/consultation";

export async function GET(request: NextRequest) {
  const service = getBookingService(request.nextUrl.searchParams.get("service"));
  const now = new Date();
  const days = listConsultationDays(now);
  const windowStart = days[0];
  const windowEnd = days[days.length - 1];
  const reserved = windowStart
    ? await prisma.person.findMany({
        where: {
          consultationAt: {
            gte: windowStart,
            lte: new Date((windowEnd || windowStart).getTime() + 24 * 60 * 60 * 1000),
          },
        },
        select: { consultationAt: true },
      })
    : [];
  const booked = new Set(
    reserved
      .map((person) => person.consultationAt?.toISOString())
      .filter((value): value is string => Boolean(value)),
  );

  return NextResponse.json({
    timezone: CONSULTATION_TIME_ZONE,
    durationMinutes: CONSULTATION_DURATION_MINUTES,
    service: service.id,
    amountCents: bookingAmountCents(service.id),
    amountLabel: bookingAmountLabel(service.id),
    days: days.map((day) => ({
      date: day.toISOString(),
      slots: slotsForConsultationDay(day, now)
        .filter((slot) => !booked.has(slot.toISOString()))
        .map((slot) => slot.toISOString()),
    })),
  });
}
