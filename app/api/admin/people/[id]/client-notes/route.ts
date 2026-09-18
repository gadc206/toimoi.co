import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z
  .object({
    consultationNotes: z.string().max(8000).nullable().optional(),
    clientLookingFor: z.string().max(4000).nullable().optional(),
    clientNonNegotiables: z.string().max(4000).nullable().optional(),
    date1Feedback: z.string().max(4000).nullable().optional(),
    date2Feedback: z.string().max(4000).nullable().optional(),
    date3Feedback: z.string().max(4000).nullable().optional(),
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
    return NextResponse.json({ error: "Invalid client notes." }, { status: 400 });
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
