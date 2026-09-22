import { NextRequest, NextResponse } from "next/server";
import { bookingAmountCents, bookingAmountLabel, getBookingService } from "@/lib/booking";
import { CONSULTATION_TIME_ZONE, slotsFromHoursList } from "@/lib/consultation";
import {
  getFounderAvailability,
  hostsForSlot,
  listAvailableDays,
  mergedHoursForDay,
} from "@/lib/consultation-hours";
import { reservedConsultationTimes } from "@/lib/consultation-reservations";

export async function GET(request: NextRequest) {
  const service = getBookingService(request.nextUrl.searchParams.get("service"));
  const now = new Date();
  const availability = await getFounderAvailability();
  const days = listAvailableDays(now, availability);
  const windowStart = days[0];
  const windowEnd = days[days.length - 1];
  const booked = new Set(
    windowStart
      ? await reservedConsultationTimes({
          gte: windowStart,
          lte: new Date((windowEnd || windowStart).getTime() + 24 * 60 * 60 * 1000),
        })
      : [],
  );

  return NextResponse.json({
    timezone: CONSULTATION_TIME_ZONE,
    durationMinutes: service.durationMinutes,
    service: service.id,
    amountCents: bookingAmountCents(service.id),
    amountLabel: bookingAmountLabel(service.id),
    days: days.map((day) => ({
      date: day.toISOString(),
      slots: slotsFromHoursList(day, mergedHoursForDay(day, availability), now)
        .filter((slot) => !booked.has(slot.toISOString()))
        .map((slot) => ({
          at: slot.toISOString(),
          hosts: hostsForSlot(slot, availability),
        })),
    })),
  });
}
