export const CONSULTATION_TIME_ZONE = "America/New_York";
export const CONSULTATION_DURATION_MINUTES = 60;
export const CONSULTATION_SLOT_HOURS = [10, 11, 12, 13, 14, 15, 16] as const;
const BOOKING_DAYS_AHEAD = 60;
const MIN_LEAD_MS = 4 * 60 * 60 * 1000;

export function formatConsultationTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: CONSULTATION_TIME_ZONE,
    timeZoneName: "short",
  }).format(value);
}

export function formatConsultationSlot(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: CONSULTATION_TIME_ZONE,
  }).format(value);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function zonedDate(year: number, month: number, day: number, hour: number, minute = 0) {
  const utc = Date.UTC(year, month - 1, day, hour, minute);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CONSULTATION_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(utc));
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const asIfUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return new Date(utc - (asIfUtc - utc));
}

function partsInZone(value: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CONSULTATION_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(value);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: get("weekday"),
  };
}

export function isConsultationWeekend(value: Date) {
  const { weekday } = partsInZone(value);
  return weekday === "Sat" || weekday === "Sun";
}

export function slotsForConsultationDay(day: Date, now = new Date()) {
  if (isConsultationWeekend(day)) return [];
  const { year, month, day: date } = partsInZone(day);
  return CONSULTATION_SLOT_HOURS.map((hour) => zonedDate(year, month, date, hour))
    .filter((slot) => slot.getTime() - now.getTime() >= MIN_LEAD_MS);
}

export function listConsultationDays(now = new Date()) {
  const start = partsInZone(now);
  const days: Date[] = [];
  for (let offset = 0; offset < BOOKING_DAYS_AHEAD; offset += 1) {
    const day = zonedDate(start.year, start.month, start.day + offset, 12);
    if (isConsultationWeekend(day)) continue;
    if (slotsForConsultationDay(day, now).length === 0) continue;
    days.push(day);
  }
  return days;
}

export function isBookableConsultationSlot(value: Date, now = new Date()) {
  if (Number.isNaN(value.getTime())) return false;
  const { year, month, day } = partsInZone(value);
  return slotsForConsultationDay(zonedDate(year, month, day, 12), now).some(
    (slot) => slot.getTime() === value.getTime(),
  );
}

function calendarUtcStamp(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function googleCalendarConsultUrl(
  when: Date,
  copy?: { title?: string; details?: string },
) {
  const end = new Date(when.getTime() + CONSULTATION_DURATION_MINUTES * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: copy?.title || "ToiMoi consultation",
    dates: `${calendarUtcStamp(when)}/${calendarUtcStamp(end)}`,
    details: copy?.details || "Personal consultation with ToiMoi. One hour, in person.",
    location: "New York",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function consultationReminderBody(args: {
  firstName: string | null;
  when: Date;
  payUrl: string | null;
}) {
  const greeting = args.firstName ? `Hi ${args.firstName},` : "Hi,";
  const pay = args.payUrl
    ? `\n\nYou can confirm and pay here (Apple Pay is available on iPhone):\n${args.payUrl}`
    : "";
  return `${greeting}

This is a warm reminder from ToiMoi. We're looking forward to your consultation on ${formatConsultationTime(args.when)}.${pay}

With love,
ToiMoi`;
}
