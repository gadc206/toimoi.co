import { randomBytes } from "crypto";
import Stripe from "stripe";
import { bookingAmountCents, bookingAmountLabel, getBookingService, type BookingServiceId } from "@/lib/booking";
import { siteBaseUrl } from "@/lib/toimo/referral";

let client: Stripe | null = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured.");
  if (!client) {
    client = new Stripe(key);
  }
  return client;
}

export function consultationAmountCents() {
  return bookingAmountCents("consultation");
}

export function consultationAmountLabel() {
  return bookingAmountLabel("consultation");
}

export async function createConsultationCheckout(args: {
  personId: string;
  email?: string | null;
  name?: string | null;
  consultationAt?: Date | null;
  service?: BookingServiceId;
}) {
  const service = getBookingService(args.service);
  const amount = bookingAmountCents(service.id);
  const stripe = getStripe();
  const base = siteBaseUrl();
  const when = args.consultationAt?.toISOString() || "";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: args.email || undefined,
    client_reference_id: args.personId,
    metadata: {
      personId: args.personId,
      consultationAt: when,
      guestName: args.name || "",
      guestEmail: args.email || "",
      service: service.id,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: service.productName,
            description: args.name ? `${service.title} with ${args.name}` : service.title,
          },
        },
      },
    ],
    success_url: `${base}/consult/paid?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${service.path}`,
    integration_identifier: `toimoi-${service.id}-${Array.from(randomBytes(8), (byte) =>
      "abcdefghijklmnopqrstuvwxyz".charAt(byte % 26),
    ).join("")}`,
  });
  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }
  return session;
}
