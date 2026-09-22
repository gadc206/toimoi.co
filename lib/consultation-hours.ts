import { prisma } from "@/lib/db";
import {
  CONSULTATION_SLOT_HOURS,
  DEFAULT_CONSULTATION_HOURS,
  FOUNDERS,
  WEEKDAYS,
  effectiveHoursForFounder,
  nyDateKey,
  slotsFromHoursList,
  zonedConsultationDate,
  type ConsultationDayHours,
  type ConsultationHoursMap,
  type DateHoursMap,
  type FounderAvailability,
  type FounderHours,
  type FounderId,
} from "@/lib/consultation";

export type { DateHoursMap, FounderAvailability, FounderHours };

function emptyHours(): ConsultationHoursMap {
  return {
    Sun: [],
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
  };
}

function normalizeSlotList(value: unknown): ConsultationDayHours {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const hour = Number((item as { hour?: unknown }).hour);
      const minute = Number((item as { minute?: unknown }).minute || 0);
      if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
      if (minute !== 0 && minute !== 30) return null;
      return { hour, minute };
    })
    .filter((item): item is { hour: number; minute: number } => Boolean(item))
    .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
}

function isLegacyOpenWeek(hours: ConsultationHoursMap) {
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
  return (
    hours.Sun.length === 0 &&
    hours.Sat.length === 0 &&
    weekdays.every(
      (day) =>
        hours[day].length === CONSULTATION_SLOT_HOURS.length &&
        CONSULTATION_SLOT_HOURS.every((hour) =>
          hours[day].some((slot) => slot.hour === hour && slot.minute === 0),
        ),
    )
  );
}

function normalizeHours(value: unknown): ConsultationHoursMap {
  const next = emptyHours();
  if (!value || typeof value !== "object") return emptyHours();
  let found = false;
  for (const day of WEEKDAYS) {
    const raw = (value as Record<string, unknown>)[day];
    if (!Array.isArray(raw)) continue;
    found = true;
    next[day] = normalizeSlotList(raw);
  }
  if (!found) return emptyHours();
  return isLegacyOpenWeek(next) ? emptyHours() : next;
}

function normalizeDates(value: unknown): DateHoursMap {
  if (!value || typeof value !== "object") return {};
  const next: DateHoursMap = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue;
    next[key] = normalizeSlotList(raw);
  }
  return next;
}

function defaultFounderHours(): FounderHours {
  return {
    noga: DEFAULT_CONSULTATION_HOURS,
    vanessa: DEFAULT_CONSULTATION_HOURS,
  };
}

function defaultAvailability(): FounderAvailability {
  return {
    weekly: defaultFounderHours(),
    dates: { noga: {}, vanessa: {} },
  };
}

function looksLikeHoursMap(value: unknown) {
  return Boolean(value && typeof value === "object" && "Mon" in value);
}

function prunePastDates(dates: DateHoursMap) {
  const today = nyDateKey(new Date());
  return Object.fromEntries(Object.entries(dates).filter(([key]) => key >= today));
}

export function normalizeFounderAvailability(value: unknown): FounderAvailability {
  if (!value || typeof value !== "object") return defaultAvailability();
  const record = value as Record<string, unknown>;

  if (record.weekly && record.dates) {
    return {
      weekly: {
        noga: normalizeHours((record.weekly as Record<string, unknown>).noga),
        vanessa: normalizeHours((record.weekly as Record<string, unknown>).vanessa),
      },
      dates: {
        noga: normalizeDates((record.dates as Record<string, unknown>).noga),
        vanessa: normalizeDates((record.dates as Record<string, unknown>).vanessa),
      },
    };
  }

  if (looksLikeHoursMap(record) && !record.noga && !record.vanessa) {
    const shared = normalizeHours(record);
    return {
      weekly: { noga: shared, vanessa: shared },
      dates: { noga: {}, vanessa: {} },
    };
  }

  return {
    weekly: {
      noga: normalizeHours(record.noga),
      vanessa: normalizeHours(record.vanessa),
    },
    dates: {
      noga: normalizeDates((record.noga as { dates?: unknown } | undefined)?.dates),
      vanessa: normalizeDates((record.vanessa as { dates?: unknown } | undefined)?.dates),
    },
  };
}

export function mergeFounderHours(byFounder: FounderHours): ConsultationHoursMap {
  const merged = emptyHours();
  for (const founder of FOUNDERS) {
    for (const day of WEEKDAYS) {
      for (const slot of byFounder[founder.id][day]) {
        if (!merged[day].some((item) => item.hour === slot.hour && item.minute === slot.minute)) {
          merged[day].push(slot);
        }
      }
      merged[day].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
    }
  }
  return merged;
}

export function mergedHoursForDay(when: Date, availability: FounderAvailability): ConsultationDayHours {
  const merged: ConsultationDayHours = [];
  for (const founder of FOUNDERS) {
    for (const slot of effectiveHoursForFounder(when, availability.weekly[founder.id], availability.dates[founder.id])) {
      if (!merged.some((item) => item.hour === slot.hour && item.minute === slot.minute)) {
        merged.push(slot);
      }
    }
  }
  return merged.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
}

export function listAvailableDays(now = new Date(), availability: FounderAvailability) {
  const key = nyDateKey(now);
  const [year, month, day] = key.split("-").map(Number);
  const days: Date[] = [];
  for (let offset = 0; offset < 60; offset += 1) {
    const date = zonedConsultationDate(year, month, day + offset, 12);
    if (slotsFromHoursList(date, mergedHoursForDay(date, availability), now).length === 0) continue;
    days.push(date);
  }
  return days;
}

export function isBookableSlot(when: Date, availability: FounderAvailability, now = new Date()) {
  if (Number.isNaN(when.getTime())) return false;
  return slotsFromHoursList(when, mergedHoursForDay(when, availability), now).some(
    (slot) => slot.getTime() === when.getTime(),
  );
}

export async function getFounderAvailability(): Promise<FounderAvailability> {
  try {
    const row = await prisma.consultationHours.findUnique({ where: { id: "default" } });
    if (!row?.slotsJson) return defaultAvailability();
    return normalizeFounderAvailability(JSON.parse(row.slotsJson));
  } catch {
    return defaultAvailability();
  }
}

export async function getFounderHours(): Promise<FounderHours> {
  return (await getFounderAvailability()).weekly;
}

export async function getConsultationHours(): Promise<ConsultationHoursMap> {
  return mergeFounderHours(await getFounderHours());
}

function toStoredJson(availability: FounderAvailability) {
  return {
    noga: { ...availability.weekly.noga, dates: prunePastDates(availability.dates.noga) },
    vanessa: { ...availability.weekly.vanessa, dates: prunePastDates(availability.dates.vanessa) },
  };
}

export async function saveFounderAvailability(value: unknown) {
  const next = normalizeFounderAvailability(value);
  const slotsJson = JSON.stringify(toStoredJson(next));
  await prisma.consultationHours.upsert({
    where: { id: "default" },
    create: { id: "default", slotsJson },
    update: { slotsJson },
  });
  return next;
}

export async function saveFounderHours(hours: FounderHours) {
  const current = await getFounderAvailability();
  return saveFounderAvailability({
    weekly: hours,
    dates: current.dates,
  });
}

export async function assignHostForSlot(when: Date, availability?: FounderAvailability) {
  const resolved = availability || (await getFounderAvailability());
  const hosts = hostsForSlot(when, resolved);
  if (hosts.length <= 1) return hosts[0];
  const counts = await Promise.all(
    hosts.map(async (host) => {
      const upcoming = await prisma.person.count({
        where: {
          OR: [
            { discoveryHost: host, discoveryAt: { gte: new Date() } },
            { consultationHost: host, consultationAt: { gte: new Date() } },
          ],
        },
      });
      return { host, upcoming };
    }),
  );
  counts.sort((a, b) => a.upcoming - b.upcoming);
  return counts[0]?.host;
}

export function hostsForSlot(when: Date, availability: FounderAvailability | FounderHours): FounderId[] {
  const weekly = "weekly" in availability ? availability.weekly : availability;
  const dates = "dates" in availability ? availability.dates : { noga: {}, vanessa: {} };
  return FOUNDERS.filter((founder) => {
    const slots = effectiveHoursForFounder(when, weekly[founder.id], dates[founder.id] || {});
    const weekdayParts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(when);
    const get = (type: string) => weekdayParts.find((part) => part.type === type)?.value || "";
    const hour = Number(get("hour"));
    const minute = Number(get("minute"));
    return slots.some((slot) => slot.hour === hour && slot.minute === minute);
  }).map((founder) => founder.id);
}
