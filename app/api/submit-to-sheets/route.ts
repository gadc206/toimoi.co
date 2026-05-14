import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const mediaFile = formData.get("media") as File | null;

    const requestOrigin = new URL(request.url).origin;

    // Upload media to Vercel Blob if provided (needs BLOB_READ_WRITE_TOKEN on Vercel)
    let mediaUrl = "";
    if (mediaFile && mediaFile.size > 0) {
      try {
        const blob = await put(
          `submissions/${Date.now()}-${mediaFile.name}`,
          mediaFile,
          { access: "private" }
        );
        mediaUrl = `${requestOrigin}/api/file?pathname=${encodeURIComponent(blob.pathname)}`;
      } catch (blobErr) {
        console.error("Blob upload failed:", blobErr);
        return NextResponse.json(
          {
            error: "File upload is not configured or failed.",
            details:
              "Add BLOB_READ_WRITE_TOKEN in Vercel (Storage → Blob) or submit without a file.",
          },
          { status: 503 }
        );
      }
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

    if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
      const missing: string[] = [];
      if (!spreadsheetId) missing.push("GOOGLE_SPREADSHEET_ID");
      if (!serviceAccountEmail) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL");
      if (!privateKey) missing.push("GOOGLE_PRIVATE_KEY");
      return NextResponse.json(
        {
          error: "Form storage is not configured.",
          details: `Missing: ${missing.join(", ")}`,
        },
        { status: 503 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // First tab is often "Sheet1" in English; set GOOGLE_SHEET_RANGE if yours differs, e.g. "Responses!A:I"
    const sheetRange = process.env.GOOGLE_SHEET_RANGE ?? "Sheet1!A:I";

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: sheetRange,
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
    console.error("Error submitting form:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to submit form", details: errorMessage },
      { status: 500 }
    );
  }
}
