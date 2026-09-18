import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  howHeard: z.string().max(500).nullable(),
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
    return NextResponse.json({ error: "Invalid source." }, { status: 400 });
  }
  const { id } = await params;
  const person = await prisma.person.update({
    where: { id },
    data: { howHeard: parsed.data.howHeard?.trim() || null },
  });
  return NextResponse.json({ person });
}
