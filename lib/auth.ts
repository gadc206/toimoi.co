import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "toimo_admin";

function sign(value: string): string {
  const secret = process.env.SESSION_SECRET || "dev-session-secret";
  const sig = createHmac("sha256", secret).update(value).digest("hex");
  return `${value}.${sig}`;
}

function verify(token: string | undefined): boolean {
  if (!token) return false;
  const [value, sig] = token.split(".");
  if (!value || !sig) return false;
  const expected = sign(value);
  const a = Buffer.from(expected);
  const b = Buffer.from(`${value}.${sig}`);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b) && value === "ok";
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verify(jar.get(COOKIE)?.value);
}

export async function setAdminSession() {
  const jar = await cookies();
  jar.set(COOKIE, sign("ok"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "changeme";
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
