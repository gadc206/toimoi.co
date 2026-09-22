export type BookingServiceId = "consultation" | "coaching" | "discovery";

export const BOOKING_SERVICES = {
  discovery: {
    id: "discovery" as const,
    title: "Discovery call",
    productName: "ToiMoi discovery call",
    calendarTitle: "ToiMoi discovery call",
    calendarDetails: "A complimentary 15-minute discovery call with ToiMoi.",
    path: "/discover",
    amountEnv: "",
    defaultCents: 0,
    durationMinutes: 15,
    requiresPayment: false,
  },
  consultation: {
    id: "consultation" as const,
    title: "Personal consultation",
    productName: "ToiMoi consultation",
    calendarTitle: "ToiMoi consultation",
    calendarDetails: "Personal consultation with ToiMoi. One hour, in person.",
    path: "/consult",
    amountEnv: "CONSULTATION_AMOUNT_CENTS",
    defaultCents: 36000,
    durationMinutes: 60,
    requiresPayment: true,
  },
  coaching: {
    id: "coaching" as const,
    title: "Clarity & Connection",
    productName: "ToiMoi Clarity & Connection",
    calendarTitle: "ToiMoi Clarity & Connection",
    calendarDetails: "Clarity & Connection session with ToiMoi.",
    path: "/clarity",
    amountEnv: "COACHING_AMOUNT_CENTS",
    defaultCents: 50000,
    durationMinutes: 60,
    requiresPayment: true,
  },
};

export function getBookingService(id?: string | null) {
  if (id === "coaching") return BOOKING_SERVICES.coaching;
  if (id === "discovery") return BOOKING_SERVICES.discovery;
  return BOOKING_SERVICES.consultation;
}

export function bookingAmountCents(id?: string | null) {
  const service = getBookingService(id);
  const raw = Number(process.env[service.amountEnv] || String(service.defaultCents));
  return Number.isFinite(raw) && raw > 0 ? Math.round(raw) : service.defaultCents;
}

export function bookingAmountLabel(id?: string | null) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(bookingAmountCents(id) / 100);
}
