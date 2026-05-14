import { randomUUID } from "node:crypto";
import path from "node:path";

import { loadEnvConfig } from "@next/env";
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { put } from "@vercel/blob";

/** Turbopack can freeze `process.env.GOOGLE_*` at compile time; re-read .env files in dev + use bracket access. */
function getGoogleSheetsEnv() {
  if (process.env.NODE_ENV !== "production") {
    loadEnvConfig(path.resolve(process.cwd()), true, console, true);
  }
  const env = process.env as NodeJS.ProcessEnv
  const privateKeyRaw = env["GOOGLE_PRIVATE_KEY"]
  return {
    spreadsheetId: env["GOOGLE_SPREADSHEET_ID"],
    serviceAccountEmail: env["GOOGLE_SERVICE_ACCOUNT_EMAIL"],
    privateKey: privateKeyRaw?.replace(/\\n/g, "\n"),
    sheetRange: env["GOOGLE_SHEET_RANGE"] ?? "Sheet1!A:J",
  }
}

/**
 * Row order must match your sheet’s header row, e.g.:
 * Lead id | Submitted at | Name | Family name | Date of birth | Sex | Email | Phone | Bio | Media URL
 */
function buildSheetRow(data: {
  timestamp: string;
  name: string;
  familyName: string;
  dateOfBirth: string;
  sex: string;
  email: string;
  phone: string;
  bio: string;
  mediaUrl: string;
}): string[] {
  return [
    randomUUID(),
    data.timestamp,
    data.name ?? "",
    data.familyName ?? "",
    data.dateOfBirth ?? "",
    data.sex ?? "",
    data.email ?? "",
    data.phone ?? "",
    data.bio ?? "",
    data.mediaUrl ?? "",
  ];
}

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
        console.error("Blob upload failed (row will still save to Sheets without media URL):", blobErr);
        mediaUrl = "";
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
    const { spreadsheetId, serviceAccountEmail, privateKey, sheetRange } = getGoogleSheetsEnv();

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

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: sheetRange,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [buildSheetRow(data)],
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
