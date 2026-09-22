import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { consultationReminderBody } from "@/lib/consultation";
import { sendToimoiEmail } from "@/lib/email";
import { nudgeMessage } from "@/lib/nudge";
import { sendWhatsAppAndLog } from "@/lib/sms/send";

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const nudged = await prisma.person.findMany({
    where: {
      status: "in_progress",
      lastNudgedAt: { lte: weekAgo },
    },
  });

  let weeklyNudges = 0;
  for (const person of nudged) {
    await sendWhatsAppAndLog(person.id, person.phone, [nudgeMessage(person.firstName)]);
    await prisma.person.update({
      where: { id: person.id },
      data: { lastNudgedAt: now },
    });
    weeklyNudges += 1;
  }

  const upcoming = await prisma.person.findMany({
    where: {
      isClient: true,
      consultationPaidAt: { not: null },
      consultationAt: { gt: now },
      consultationReminderSentAt: null,
      email: { not: null },
    },
  });

  let consultEmails = 0;
  for (const person of upcoming) {
    if (!person.consultationAt || !person.email) continue;
    const hoursUntil = (person.consultationAt.getTime() - now.getTime()) / (60 * 60 * 1000);
    if (hoursUntil > 36 || hoursUntil < 12) continue;
    try {
      await sendToimoiEmail({
        to: person.email,
        subject: "Your ToiMoi consultation is tomorrow",
        text: consultationReminderBody({
          firstName: person.firstName,
          when: person.consultationAt,
          payUrl: person.consultationCheckoutUrl,
        }),
      });
      await prisma.person.update({
        where: { id: person.id },
        data: { consultationReminderSentAt: now },
      });
      consultEmails += 1;
    } catch (error) {
      console.error("consultation reminder failed", person.id, error);
    }
  }

  return NextResponse.json({ ok: true, weeklyNudges, consultEmails });
}
