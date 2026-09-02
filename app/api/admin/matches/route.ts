import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { assessAndStorePair, loadPair } from "@/lib/matching";
import type { MatchRecord } from "@/lib/types";

const createSchema = z.object({
  personAId: z.string().min(1),
  personBId: z.string().min(1),
  matchmakerId: z.string().min(1),
  status: z.enum(["approved", "proposed"]).default("approved"),
  notes: z.string().max(2000).optional().nullable(),
  overrideNote: z.string().max(1000).optional().nullable(),
});

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid match." },
      { status: 400 },
    );
  }

  try {
    const matchmaker = await prisma.matchmaker.findUnique({
      where: { id: parsed.data.matchmakerId },
    });
    if (!matchmaker) {
      return NextResponse.json({ error: "Choose Vanessa or Noga." }, { status: 400 });
    }
    const { personA, personB } = await loadPair(
      parsed.data.personAId,
      parsed.data.personBId,
    );
    const assessment = await assessAndStorePair(personA, personB);
    if (assessment.eligibility !== "pass" && !parsed.data.overrideNote?.trim()) {
      return NextResponse.json(
        {
          error: "This pair has warnings. Add an override note before saving.",
          assessment,
        },
        { status: 409 },
      );
    }

    const existing = (await prisma.match.findMany()) as MatchRecord[];
    const duplicate = existing.find(
      (item) =>
        item.status !== "closed" &&
        ((item.personAId === personA.id && item.personBId === personB.id) ||
          (item.personAId === personB.id && item.personBId === personA.id)),
    );
    if (duplicate) {
      return NextResponse.json(
        { error: "An active match already exists for this pair.", matchId: duplicate.id },
        { status: 409 },
      );
    }

    const match = await prisma.match.create({
      data: {
        personAId: assessment.personAId,
        personBId: assessment.personBId,
        source: "manual",
        createdByMatchmakerId: matchmaker.id,
        assessmentId: assessment.id,
        status: parsed.data.status,
        notes: parsed.data.notes?.trim() || null,
        overrideNote: parsed.data.overrideNote?.trim() || null,
      },
    });
    return NextResponse.json({ match }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create match." },
      { status: 400 },
    );
  }
}
