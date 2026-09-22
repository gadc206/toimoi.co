import { NextRequest, NextResponse } from "next/server";
import { getBookingService } from "@/lib/booking";
import { formatConsultationTime, googleCalendarConsultUrl } from "@/lib/consultation";
import { getStripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session." }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const service = getBookingService(session.metadata?.service);
    const whenRaw = session.metadata?.consultationAt;
    const when = whenRaw ? new Date(whenRaw) : null;
    const validWhen = when && !Number.isNaN(when.getTime()) ? when : null;
    const paid = session.payment_status === "paid";
    return NextResponse.json({
      paid,
      title: service.title,
      when: paid && validWhen ? validWhen.toISOString() : null,
      whenLabel: paid && validWhen ? formatConsultationTime(validWhen) : null,
      calendarUrl:
        paid && validWhen
          ? googleCalendarConsultUrl(validWhen, {
              title: service.calendarTitle,
              details: service.calendarDetails,
            })
          : null,
    });
  } catch {
    return NextResponse.json({ error: "Could not load this payment." }, { status: 404 });
  }
}
