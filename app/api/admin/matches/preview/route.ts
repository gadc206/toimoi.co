import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/auth";
import { assessAndStorePair, loadPair } from "@/lib/matching";

const schema = z.object({
  personAId: z.string().min(1),
  personBId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose two people." }, { status: 400 });
  }
  try {
    const { personA, personB } = await loadPair(
      parsed.data.personAId,
      parsed.data.personBId,
    );
    const assessment = await assessAndStorePair(personA, personB);
    return NextResponse.json({
      assessment,
      people: {
        personA: { id: personA.id, name: personA.firstName || personA.phone },
        personB: { id: personB.id, name: personB.firstName || personB.phone },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not assess this pair." },
      { status: 400 },
    );
  }
}
