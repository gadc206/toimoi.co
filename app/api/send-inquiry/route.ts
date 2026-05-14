import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("send-inquiry: RESEND_API_KEY is not set");
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 503 }
    );
  }

  const resend = new Resend(apiKey);

  try {
    const { name, email, phone, message, serviceType } = await request.json();

    const serviceNames: Record<string, string> = {
      discovery: "Discovery Call",
      consultation: "Personal Consultation",
      coaching: "Clarity & Connection Session",
      signature: "The Signature Experience",
    };

    const serviceName = serviceNames[serviceType] || "General Inquiry";

    const emailContent = `
New inquiry from ToiMoi website

Service: ${serviceName}

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}

Message:
${message || "No message provided"}
    `.trim();

    const { error } = await resend.emails.send({
      from: "ToiMoi <onboarding@resend.dev>",
      to: "toimoinow@gmail.com",
      subject: `New ${serviceName} Inquiry from ${name}`,
      text: emailContent,
      replyTo: email,
    });

    if (error) {
      console.error("Error sending email:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing inquiry:", error);
    return NextResponse.json(
      { error: "Failed to process inquiry" },
      { status: 500 }
    );
  }
}
