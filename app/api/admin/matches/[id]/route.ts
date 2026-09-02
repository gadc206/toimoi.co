import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  status: z
    .enum(["draft", "approved", "proposed", "dating", "paused", "closed", "engaged", "married"])
    .optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }
  const { id } = await params;
  try {
    const match = await prisma.match.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ match });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update match." },
      { status: 404 },
    );
  }
}
