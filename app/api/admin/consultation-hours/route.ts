import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  getFounderAvailability,
  saveFounderAvailability,
  type FounderAvailability,
} from "@/lib/consultation-hours";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ hours: await getFounderAvailability() });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { hours?: FounderAvailability } | FounderAvailability | null;
  const payload = body && "hours" in body ? body.hours : body;
  if (!payload) {
    return NextResponse.json({ error: "Those hours are not valid." }, { status: 400 });
  }
  const hours = await saveFounderAvailability(payload);
  return NextResponse.json({ hours });
}
