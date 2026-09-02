import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { MatchStatus } from "@/lib/types";

const schema = z.object({
  stage: z.enum([
    "proposed",
    "accepted",
    "declined",
    "first_date",
    "second_date",
    "continued",
    "ended",
    "engaged",
    "married",
  ]),
  personAResponse: z.string().max(500).nullable().optional(),
  personBResponse: z.string().max(500).nullable().optional(),
  reasonCode: z.string().max(100).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  occurredAt: z.string().datetime().optional(),
});

const MATCH_STATUS_BY_STAGE: Record<string, string> = {
  proposed: "proposed",
  accepted: "proposed",
  declined: "closed",
  first_date: "dating",
  second_date: "dating",
  continued: "dating",
  ended: "closed",
  engaged: "engaged",
  married: "married",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid outcome." },
      { status: 400 },
    );
  }
  const { id } = await params;
  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) return NextResponse.json({ error: "Match not found." }, { status: 404 });

  const outcome = await prisma.matchOutcome.create({
    data: {
      matchId: id,
      stage: parsed.data.stage,
      personAResponse: parsed.data.personAResponse,
      personBResponse: parsed.data.personBResponse,
      reasonCode: parsed.data.reasonCode,
      notes: parsed.data.notes,
      occurredAt: parsed.data.occurredAt ? new Date(parsed.data.occurredAt) : new Date(),
    },
  });
  await prisma.match.update({
    where: { id },
    data: { status: MATCH_STATUS_BY_STAGE[parsed.data.stage] as MatchStatus },
  });
  return NextResponse.json({ outcome }, { status: 201 });
}
