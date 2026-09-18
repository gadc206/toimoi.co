export type BookingServiceId = "consultation" | "coaching";

export const BOOKING_SERVICES = {
  consultation: {
    id: "consultation" as const,
    title: "Personal consultation",
    productName: "ToiMoi consultation",
    calendarTitle: "ToiMoi consultation",
    calendarDetails: "Personal consultation with ToiMoi. One hour, in person.",
    path: "/consult",
    amountEnv: "CONSULTATION_AMOUNT_CENTS",
    defaultCents: 36000,
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
  },
};

export function getBookingService(id?: string | null) {
  return id === "coaching" ? BOOKING_SERVICES.coaching : BOOKING_SERVICES.consultation;
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
