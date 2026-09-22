import { google } from "googleapis";
import { CONSULTATION_DURATION_MINUTES, CONSULTATION_TIME_ZONE } from "@/lib/consultation";

const TOIMOI_CALENDAR_ID = "toimoinow@gmail.com";

function googleCredentials() {
  const env = process.env as NodeJS.ProcessEnv;
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !privateKey) return null;
  return { email, privateKey };
}

export async function addToimoCalendarEvent(args: {
  title: string;
  when: Date;
  durationMinutes?: number;
  description?: string;
  guestEmail?: string | null;
}) {
  const credentials = googleCredentials();
  if (!credentials || Number.isNaN(args.when.getTime())) return;

  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim() || TOIMOI_CALENDAR_ID;
  const minutes = args.durationMinutes || CONSULTATION_DURATION_MINUTES;
  const end = new Date(args.when.getTime() + minutes * 60 * 1000);
  const guestEmail = args.guestEmail?.trim();

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.email,
      private_key: credentials.privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  const calendar = google.calendar({ version: "v3", auth });

  await calendar.events.insert({
    calendarId,
    sendUpdates: "none",
    requestBody: {
      summary: args.title,
      description: args.description || "",
      start: { dateTime: args.when.toISOString(), timeZone: CONSULTATION_TIME_ZONE },
      end: { dateTime: end.toISOString(), timeZone: CONSULTATION_TIME_ZONE },
      guestsCanInviteOthers: false,
      guestsCanModify: false,
      ...(guestEmail ? { attendees: [{ email: guestEmail }] } : {}),
    },
  });
}
