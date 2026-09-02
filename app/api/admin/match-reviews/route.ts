import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { MatchRecord } from "@/lib/types";

const schema = z.object({
  assessmentId: z.string().min(1),
  matchmakerId: z.string().min(1),
  decision: z.enum(["approve", "reject", "hold"]),
  reasonCodes: z.array(z.string().max(100)).max(10).optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review." }, { status: 400 });
  }
  const [assessment, matchmaker] = await Promise.all([
    prisma.matchAssessment.findUnique({ where: { id: parsed.data.assessmentId } }),
    prisma.matchmaker.findUnique({ where: { id: parsed.data.matchmakerId } }),
  ]);
  if (!assessment || !matchmaker) {
    return NextResponse.json({ error: "Assessment or matchmaker not found." }, { status: 404 });
  }
  if (
    parsed.data.decision === "approve" &&
    assessment.eligibility !== "pass" &&
    !parsed.data.notes?.trim()
  ) {
    return NextResponse.json(
      { error: "Add a note explaining the override before approving." },
      { status: 409 },
    );
  }

  const review = await prisma.matchReview.create({
    data: {
      assessmentId: assessment.id,
      matchmakerId: matchmaker.id,
      decision: parsed.data.decision,
      reasonCodes: parsed.data.reasonCodes,
      notes: parsed.data.notes,
    },
  });

  let match: MatchRecord | null = null;
  if (parsed.data.decision === "approve") {
    const existing = (await prisma.match.findMany()) as MatchRecord[];
    match =
      existing.find(
        (item) =>
          item.status !== "closed" &&
          ((item.personAId === assessment.personAId &&
            item.personBId === assessment.personBId) ||
            (item.personAId === assessment.personBId &&
              item.personBId === assessment.personAId)),
      ) || null;
    if (!match) {
      match = await prisma.match.create({
        data: {
          personAId: assessment.personAId,
          personBId: assessment.personBId,
          source: "algorithm",
          createdByMatchmakerId: matchmaker.id,
          assessmentId: assessment.id,
          status: "approved",
          notes: parsed.data.notes?.trim() || null,
          overrideNote:
            assessment.eligibility === "pass" ? null : parsed.data.notes?.trim() || null,
        },
      });
    }
  }
  return NextResponse.json({ review, match }, { status: 201 });
}
