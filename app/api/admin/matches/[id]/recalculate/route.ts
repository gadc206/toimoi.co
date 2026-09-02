import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { assessAndStorePair } from "@/lib/matching";
import type { MatchWithDetails } from "@/lib/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const match = (await prisma.match.findUnique({
    where: { id },
    include: { details: true },
  })) as MatchWithDetails | null;
  if (!match) return NextResponse.json({ error: "Match not found." }, { status: 404 });
  const assessment = await assessAndStorePair(match.personA, match.personB, { force: true });
  await prisma.match.update({
    where: { id },
    data: { assessmentId: assessment.id },
  });
  return NextResponse.json({ assessment });
}
