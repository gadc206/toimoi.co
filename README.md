# ToiMoi website

Boutique matchmaking site for [ToiMoi](https://www.toimoi.co) — Next.js (App Router), Tailwind CSS v4, and shadcn-style UI.

## Local development

```bash
cd toimoi
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm start
```

## Vercel environment variables


| Variable                       | Used by                               | Notes                                                                                   |
| ------------------------------ | ------------------------------------- | --------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`               | `/api/send-inquiry`                   | Required for contact form emails. Without it, the API returns 503.                      |
| `BLOB_READ_WRITE_TOKEN`        | `/api/submit-to-sheets` (file upload) | From Vercel Blob; required when users attach a photo or video.                          |
| `GOOGLE_SPREADSHEET_ID`        | `/api/submit-to-sheets`               | Google Sheet ID for the join-database form rows.                                        |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `/api/submit-to-sheets`               | Service account client email.                                                           |
| `GOOGLE_PRIVATE_KEY`           | `/api/submit-to-sheets`               | Service account private key (paste with `\n` for newlines, or single-line PEM).         |
| `GOOGLE_SHEET_RANGE`           | `/api/submit-to-sheets`               | Optional. Default `Sheet1!A:I`. Set if your tab has another name, e.g. `Responses!A:I`. |


After adding `RESEND_API_KEY`, set a verified **from** domain in [Resend](https://resend.com) and update the `from` field in `app/api/send-inquiry/route.ts` if you no longer use `onboarding@resend.dev`.

## Why Google Sheets often failed on v0

v0 can generate the API route, but **it cannot magically connect your Google account**. Submissions fail unless **all** of this is true:

1. **Environment variables** — `GOOGLE_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_PRIVATE_KEY` must be set on the **same host** that runs the API (e.g. Vercel). v0 previews and “try it” flows often **do not** have your secrets, so the route returns **503** (“not configured”) or errors.
2. `**GOOGLE_PRIVATE_KEY` formatting** — In Vercel, multiline keys break unless you paste the key as **one line** with `\n` where each line break was, or use Vercel’s multiline env editor. A mangled key causes cryptic auth errors.
3. **Sheet not shared** — The **service account email** (looks like `something@project-id.iam.gserviceaccount.com`) must be invited to the spreadsheet with **Editor** access. If you skip this, Google returns **403 Permission denied**.
4. **Sheets API disabled** — In Google Cloud Console, **Google Sheets API** must be **enabled** for the project that owns the service account.
5. **Wrong tab name** — The code appends to `**Sheet1!A:I`** by default. If your first tab is named `Form responses` or `Data`, set `**GOOGLE_SHEET_RANGE**` (e.g. `Data!A:I`).
6. **File uploads** — If the user attaches a photo/video, `**BLOB_READ_WRITE_TOKEN`** must be set on Vercel (Blob storage). Without it, upload fails before the row is written (this project returns a clear **503** for that case).

Running the site **here** (this repo + Vercel) fixes the **code** side (auth, range, errors). **You** still complete the Google + Vercel steps below once.

## Connect the join-database form to Google Sheets (step by step)

### 1. Create a Google Cloud project and enable Sheets API

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (or pick an existing one).
3. Go to **APIs & Services → Library**, search **Google Sheets API**, click **Enable**.

### 2. Create a service account and JSON key

1. **APIs & Services → Credentials → Create credentials → Service account.**
2. Finish the wizard, then open the service account → **Keys → Add key → JSON**.
3. Download the JSON file. You will need:
  - `**client_email`** → use as `**GOOGLE_SERVICE_ACCOUNT_EMAIL**` in Vercel.
  - `**private_key**` → use as `**GOOGLE_PRIVATE_KEY**` in Vercel (keep the full `-----BEGIN PRIVATE KEY-----` … `-----END PRIVATE KEY-----` block).

**Vercel tip:** Paste `private_key` in the env var as a **single line**, replacing real newlines with the two characters `\` and `n`. The code turns those back into newlines.

### 3. Create the spreadsheet and share it

1. In [Google Sheets](https://sheets.google.com), create a new spreadsheet.
2. Copy the **spreadsheet ID** from the URL:
  `https://docs.google.com/spreadsheets/d/**THIS_PART_IS_THE_ID**/edit`  
   → set `**GOOGLE_SPREADSHEET_ID`** in Vercel.
3. Click **Share**, add the **service account `client_email`**, role **Editor**, send.

### 4. Header row (recommended)

In row 1 of the tab, add headers matching the 9 columns, for example:

`Timestamp | First name | Family name | DOB | Sex | Email | Phone | Bio | Media URL`

The API **appends** data starting at the next empty row; headers are optional but help readability.

### 5. Tab name / range

- If the tab at the bottom is literally **Sheet1**, you need nothing extra.
- If it is named something else, in Vercel set `**GOOGLE_SHEET_RANGE`** to `YourTabName!A:I` (same 9 columns).

### 6. Add variables in Vercel

**Vercel → Project → Settings → Environment Variables** (Production + Preview as needed):

- `GOOGLE_SPREADSHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- Optional: `GOOGLE_SHEET_RANGE`
- If users upload files: `BLOB_READ_WRITE_TOKEN` (create a Blob store in Vercel **Storage**).

Redeploy after saving env vars.

### 7. Test locally (optional)

Create `**/Users/chloegad/Desktop/toimoi/.env.local`** with the same variables, then:

```bash
cd /Users/chloegad/Desktop/toimoi
npm run dev
```

Submit the form. If something fails, check the **terminal** where `npm run dev` is running for logs, or the **Network** tab in the browser for the `/api/submit-to-sheets` response JSON (`details` field).