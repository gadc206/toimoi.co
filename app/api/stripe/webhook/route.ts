import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBookingService } from "@/lib/booking";
import { formatConsultationTime, googleCalendarConsultUrl } from "@/lib/consultation";
import { isConsultationSlotTaken, releaseUnpaidCheckoutHold } from "@/lib/consultation-reservations";
import { sendToimoiEmail, TOIMOI_NOTIFY_EMAIL } from "@/lib/email";
import { addToimoCalendarEvent } from "@/lib/google-calendar";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const personId =
      session.metadata?.personId || session.client_reference_id || undefined;
    const whenRaw = session.metadata?.consultationAt;
    const when = whenRaw ? new Date(whenRaw) : null;
    const validWhen = when && !Number.isNaN(when.getTime()) ? when : null;
    if (session.payment_status === "paid") {
      const paidAt = new Date();
      const service = getBookingService(session.metadata?.service);
      const slotTaken =
        validWhen && personId ? await isConsultationSlotTaken(validWhen, personId) : false;
      const paidData = {
        consultationPaidAt: paidAt,
        ...(validWhen && !slotTaken ? { consultationAt: validWhen } : {}),
        ...(service.id === "consultation" ? { isClient: true } : {}),
        ...(session.metadata?.host ? { consultationHost: session.metadata.host } : {}),
      };
      if (personId) {
        await prisma.person.updateMany({
          where: { id: personId },
          data: paidData,
        });
      } else if (session.id) {
        await prisma.person.updateMany({
          where: { stripeCheckoutSessionId: session.id },
          data: paidData,
        });
      }

      const guestEmail = session.metadata?.guestEmail || session.customer_details?.email || session.customer_email;
      const guestName = session.metadata?.guestName || "Someone";
      const whenLabel = validWhen ? formatConsultationTime(validWhen) : "the booked time";
      const calendarUrl = validWhen
        ? googleCalendarConsultUrl(validWhen, {
            title: service.calendarTitle,
            details: service.calendarDetails,
          })
        : "";
      try {
        await sendToimoiEmail({
          to: TOIMOI_NOTIFY_EMAIL,
          replyTo: guestEmail || undefined,
          subject: `${service.title} paid: ${guestName}`,
          text: slotTaken
            ? `${guestName} paid for ${service.title}, but ${whenLabel} was already taken.\n\nEmail: ${guestEmail || "not given"}`
            : `${guestName} paid for ${service.title}.\n\nWhen: ${whenLabel}\nEmail: ${guestEmail || "not given"}`,
        });
      } catch (error) {
        console.error("consultation paid notice failed", error);
      }
      if (validWhen && !slotTaken) {
        try {
          await addToimoCalendarEvent({
            title: `${service.title}: ${guestName}`,
            when: validWhen,
            durationMinutes: service.durationMinutes,
            description: `${guestName}\nEmail: ${guestEmail || "not given"}\nSource: Website`,
            guestEmail,
          });
        } catch (error) {
          console.error("toimo calendar event failed", error);
        }
      }
      if (guestEmail && calendarUrl && !slotTaken) {
        try {
          await sendToimoiEmail({
            to: guestEmail,
            subject: `Your ${service.title} is confirmed`,
            text: `Hi ${guestName.split(/\s+/)[0]},\n\nYour ${service.title} is confirmed for ${whenLabel}.\n\nAdd it to Google Calendar:\n${calendarUrl}\n\nWith love,\nToiMoi`,
          });
        } catch (error) {
          console.error("consultation guest email failed", error);
        }
      }
    }
  }

  if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object;
    await releaseUnpaidCheckoutHold({
      sessionId: session.id,
      personId: session.metadata?.personId || session.client_reference_id || undefined,
    });
  }

  return NextResponse.json({ received: true });
}
