import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const mediaFile = formData.get("media") as File | null;

    // Upload media to Vercel Blob if provided
    let mediaUrl = "";
    if (mediaFile && mediaFile.size > 0) {
      const blob = await put(
        `submissions/${Date.now()}-${mediaFile.name}`,
        mediaFile,
        { access: "private" }
      );
      // For private blobs, we store the pathname and serve via our API
      mediaUrl = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''}/api/file?pathname=${encodeURIComponent(blob.pathname)}`;
    }

    const data = {
      timestamp: new Date().toISOString(),
      name: formData.get("name") as string,
      familyName: formData.get("familyName") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      sex: formData.get("sex") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      bio: formData.get("bio") as string,
      mediaUrl: mediaUrl,
    };

    // Google Sheets API setup
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    // Debug: Check which env vars are missing
    console.log("[v0] Checking credentials...");
    console.log("[v0] SPREADSHEET_ID exists:", !!spreadsheetId);
    console.log("[v0] SERVICE_ACCOUNT_EMAIL exists:", !!serviceAccountEmail);
    console.log("[v0] PRIVATE_KEY exists:", !!privateKey);
    console.log("[v0] PRIVATE_KEY starts with:", privateKey?.substring(0, 30));

    if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
      const missing = [];
      if (!spreadsheetId) missing.push("GOOGLE_SPREADSHEET_ID");
      if (!serviceAccountEmail) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL");
      if (!privateKey) missing.push("GOOGLE_PRIVATE_KEY");
      throw new Error(`Missing credentials: ${missing.join(", ")}`);
    }

    const auth = new google.auth.JWT(
      serviceAccountEmail,
      undefined,
      privateKey,
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    console.log("[v0] Attempting to append to spreadsheet:", spreadsheetId);

    // Append row to the spreadsheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:I",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            data.timestamp,
            data.name,
            data.familyName,
            data.dateOfBirth,
            data.sex,
            data.email,
            data.phone,
            data.bio,
            data.mediaUrl,
          ],
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error submitting form:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[v0] Error details:", errorMessage);
    return NextResponse.json(
      { error: "Failed to submit form", details: errorMessage },
      { status: 500 }
    );
  }
}
