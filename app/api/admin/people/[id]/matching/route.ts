import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z
  .object({
    partnerAgeRange: z.string().max(100).nullable().optional(),
    relocationFlexibility: z.string().max(300).nullable().optional(),
    hasChildren: z.string().max(100).nullable().optional(),
    openToPartnerChildren: z.string().max(300).nullable().optional(),
    smokingBoundaries: z.string().max(500).nullable().optional(),
    marriageTimeline: z.string().max(500).nullable().optional(),
    matchmakerEligibilityNotes: z.string().max(2000).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid matching details." }, { status: 400 });
  }
  const { id } = await params;
  await prisma.profileAnswers.upsert({
    where: { personId: id },
    create: { personId: id },
    update: {},
  });
  const profile = await prisma.profileAnswers.update({
    where: { personId: id },
    data: parsed.data,
  });
  return NextResponse.json({ profile });
}
