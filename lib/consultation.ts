export const CONSULTATION_TIME_ZONE = "America/New_York";
export const CONSULTATION_DURATION_MINUTES = 60;
export const CONSULTATION_SLOT_HOURS = [10, 11, 12, 13, 14, 15, 16] as const;
export const CONSULTATION_CHECKOUT_HOLD_MS = 30 * 60 * 1000;

export function isActiveConsultationReservation(
  person: {
    consultationPaidAt: Date | null;
    isClient: boolean;
    updatedAt: Date;
  },
  now = new Date(),
) {
  if (person.consultationPaidAt) return true;
  if (person.isClient) return true;
  return now.getTime() - person.updatedAt.getTime() < CONSULTATION_CHECKOUT_HOLD_MS;
}
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

export const FOUNDERS = [
  { id: "noga", name: "Noga" },
  { id: "vanessa", name: "Vanessa" },
] as const;
export type FounderId = (typeof FOUNDERS)[number]["id"];

export const SIMPLE_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
export const SIMPLE_HOUR_TIMES = CONSULTATION_SLOT_HOURS.map((hour) => ({ hour, minute: 0 }));

export function founderName(id?: string | null) {
  return FOUNDERS.find((founder) => founder.id === id)?.name || null;
}

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export type Weekday = (typeof WEEKDAYS)[number];
export type ConsultationDayHours = { hour: number; minute: number }[];
export type ConsultationHoursMap = Record<Weekday, ConsultationDayHours>;
export type FounderHours = Record<FounderId, ConsultationHoursMap>;
export type DateHoursMap = Record<string, ConsultationDayHours>;
export type FounderAvailability = {
  weekly: FounderHours;
  dates: Record<FounderId, DateHoursMap>;
};

export const DEFAULT_CONSULTATION_HOURS: ConsultationHoursMap = {
  Sun: [],
  Mon: [],
  Tue: [],
  Wed: [],
  Thu: [],
  Fri: [],
  Sat: [],
};

export function slotClockLabel(hour: number, minute: number) {
  const date = new Date(Date.UTC(2026, 0, 1, hour, minute));
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export function hasConsultationHour(
  hours: ConsultationHoursMap,
  day: Weekday,
  hour: number,
  minute: number,
) {
  return hours[day].some((slot) => slot.hour === hour && slot.minute === minute);
}

export function zonedConsultationDate(year: number, month: number, day: number, hour: number, minute = 0) {
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

function zonedDate(year: number, month: number, day: number, hour: number, minute = 0) {
  return zonedConsultationDate(year, month, day, hour, minute);
}

export function consultationDateTimeLocal(value: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CONSULTATION_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function consultationDateFromLocalInput(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;
  const date = zonedConsultationDate(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

export function nyDateKey(value: Date) {
  const { year, month, day } = partsInZone(value);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function weekdayInNy(value: Date): Weekday {
  const { weekday } = partsInZone(value);
  return (WEEKDAYS.includes(weekday as Weekday) ? weekday : "Mon") as Weekday;
}

export function effectiveHoursForFounder(
  when: Date,
  weekly: ConsultationHoursMap,
  dates: DateHoursMap,
): ConsultationDayHours {
  const key = nyDateKey(when);
  if (Object.prototype.hasOwnProperty.call(dates, key)) return dates[key];
  return weekly[weekdayInNy(when)] || [];
}

export function slotsFromHoursList(day: Date, hours: ConsultationDayHours, now = new Date()) {
  const { year, month, day: date } = partsInZone(day);
  return hours
    .map(({ hour, minute }) => zonedDate(year, month, date, hour, minute))
    .filter((slot) => slot.getTime() - now.getTime() >= MIN_LEAD_MS);
}

function partsInZone(value: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CONSULTATION_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: get("weekday"),
    hour: Number(get("hour") || 0),
    minute: Number(get("minute") || 0),
  };
}

export function isConsultationWeekend(value: Date) {
  const { weekday } = partsInZone(value);
  return weekday === "Sat" || weekday === "Sun";
}

function hoursForWeekday(weekday: string, hours?: ConsultationHoursMap): ConsultationDayHours {
  const key = WEEKDAYS.includes(weekday as Weekday) ? (weekday as Weekday) : null;
  if (hours && key) return hours[key];
  if (weekday === "Sat" || weekday === "Sun") return [];
  return CONSULTATION_SLOT_HOURS.map((hour) => ({ hour, minute: 0 }));
}

export function slotsForConsultationDay(
  day: Date,
  now = new Date(),
  hours?: ConsultationHoursMap,
) {
  const { year, month, day: date, weekday } = partsInZone(day);
  return hoursForWeekday(weekday, hours)
    .map(({ hour, minute }) => zonedDate(year, month, date, hour, minute))
    .filter((slot) => slot.getTime() - now.getTime() >= MIN_LEAD_MS);
}

export function listConsultationDays(now = new Date(), hours?: ConsultationHoursMap) {
  const start = partsInZone(now);
  const days: Date[] = [];
  for (let offset = 0; offset < BOOKING_DAYS_AHEAD; offset += 1) {
    const day = zonedDate(start.year, start.month, start.day + offset, 12);
    if (slotsForConsultationDay(day, now, hours).length === 0) continue;
    days.push(day);
  }
  return days;
}

export function isBookableConsultationSlot(
  value: Date,
  now = new Date(),
  hours?: ConsultationHoursMap,
) {
  if (Number.isNaN(value.getTime())) return false;
  const { year, month, day } = partsInZone(value);
  return slotsForConsultationDay(zonedDate(year, month, day, 12), now, hours).some(
    (slot) => slot.getTime() === value.getTime(),
  );
}

function calendarUtcStamp(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function googleCalendarConsultUrl(
  when: Date,
  copy?: { title?: string; details?: string; durationMinutes?: number },
) {
  const minutes = copy?.durationMinutes || CONSULTATION_DURATION_MINUTES;
  const end = new Date(when.getTime() + minutes * 60 * 1000);
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
