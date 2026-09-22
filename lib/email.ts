import { Resend } from "resend";
import { formatConsultationTime } from "@/lib/consultation";
import { addToimoCalendarEvent } from "@/lib/google-calendar";

export const TOIMOI_NOTIFY_EMAIL = "toimoinow@gmail.com";

export function toimoiFromAddress() {
  return process.env.TOIMOI_FROM_EMAIL?.trim() || "ToiMoi <onboarding@resend.dev>";
}

export async function sendToimoiEmail(args: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Email service is not configured.");
  }
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: toimoiFromAddress(),
    to: args.to,
    subject: args.subject,
    text: args.text,
    ...(args.replyTo ? { replyTo: args.replyTo } : {}),
  });
  if (error) {
    throw new Error(error.message || "Failed to send email.");
  }
}

export async function notifyConsultationScheduled(args: {
  name?: string | null;
  email?: string | null;
  when: Date;
  serviceTitle?: string;
  source?: string;
  durationMinutes?: number;
}) {
  const name = args.name?.trim() || "Someone";
  const email = args.email?.trim() || "";
  const service = args.serviceTitle || "Personal consultation";
  const source = args.source || "Website";
  try {
    await sendToimoiEmail({
      to: TOIMOI_NOTIFY_EMAIL,
      replyTo: email || undefined,
      subject: `${service} scheduled: ${name}`,
      text: `${name} scheduled a ${service}.\n\nWhen: ${formatConsultationTime(args.when)}\nEmail: ${email || "not given"}\nSource: ${source}`,
    });
  } catch (error) {
    console.error("consultation scheduled notice failed", error);
  }
  try {
    await addToimoCalendarEvent({
      title: `${service}: ${name}`,
      when: args.when,
      durationMinutes: args.durationMinutes,
      description: `${name}\nEmail: ${email || "not given"}\nSource: ${source}`,
      guestEmail: email,
    });
  } catch (error) {
    console.error("toimo calendar event failed", error);
  }
}
