import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

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

    // Google Sheets API setup
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
      throw new Error("Google Sheets credentials not configured");
    }

    const auth = new google.auth.JWT(
      serviceAccountEmail,
      undefined,
      privateKey,
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({ version: "v4", auth });

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
            data.hasMedia,
          ],
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 }
    );
  }
}
