import { Resend } from "resend";

export function toimoiFromAddress() {
  return process.env.TOIMOI_FROM_EMAIL?.trim() || "ToiMoi <onboarding@resend.dev>";
}

export async function sendToimoiEmail(args: {
  to: string;
  subject: string;
  text: string;
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
  });
  if (error) {
    throw new Error(error.message || "Failed to send email.");
  }
}
