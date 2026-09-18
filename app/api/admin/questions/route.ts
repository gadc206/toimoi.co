import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  text: z.string().trim().min(2).max(240),
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const questions = await prisma.adminQuestion.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ questions });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Write a question first." }, { status: 400 });
  }
  const question = await prisma.adminQuestion.upsert({
    where: { text: parsed.data.text },
    update: {},
    create: { text: parsed.data.text },
  });
  return NextResponse.json({ question });
}
