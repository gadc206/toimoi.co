import { prisma } from "@/lib/db";
import { splitSms } from "@/lib/sms/split";

export async function logOutboundOnly(personId: string, bodies: string[]) {
  const chunks = bodies.flatMap((body) => splitSms(body));
  await Promise.all(
    chunks.map((body) =>
      prisma.message.create({
        data: { personId, direction: "outbound", body },
      }),
    ),
  );
  return chunks;
}
