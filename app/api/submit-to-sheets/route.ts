import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const data = {
      timestamp: new Date().toISOString(),
      name: formData.get("name") as string,
      familyName: formData.get("familyName") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      sex: formData.get("sex") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      bio: formData.get("bio") as string,
      hasMedia: formData.get("media") ? "Yes" : "No",
    };

    // Send to Zapier webhook
    const zapierWebhookUrl = process.env.ZAPIER_WEBHOOK_URL;

    if (!zapierWebhookUrl) {
      throw new Error("ZAPIER_WEBHOOK_URL is not configured");
    }

    const response = await fetch(zapierWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to send data to Zapier");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 }
    );
  }
}
