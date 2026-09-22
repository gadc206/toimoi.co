import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { FOUNDERS, formatConsultationTime } from "@/lib/consultation";
import { getFounderAvailability } from "@/lib/consultation-hours";
import { prisma } from "@/lib/db";
import { HoursEditor } from "./HoursEditor";

export const dynamic = "force-dynamic";

export default async function ConsultationsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const [hours, people] = await Promise.all([
    getFounderAvailability(),
    prisma.person.findMany({
      where: {
        OR: [{ consultationAt: { not: null } }, { discoveryAt: { not: null } }],
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        firstName: true,
        consultationAt: true,
        consultationPaidAt: true,
        consultationHost: true,
        discoveryAt: true,
        discoveryHost: true,
      },
    }),
  ]);

  const items = people
    .flatMap((person) => {
      const rows: {
        id: string;
        personId: string;
        name: string;
        when: Date;
        kind: string;
        host: string | null;
        paid?: boolean;
      }[] = [];
      if (person.consultationAt) {
        rows.push({
          id: `${person.id}-consult`,
          personId: person.id,
          name: person.firstName || "Unnamed",
          when: person.consultationAt,
          kind: "Consultation",
          host: person.consultationHost,
          paid: Boolean(person.consultationPaidAt),
        });
      }
      if (person.discoveryAt) {
        rows.push({
          id: `${person.id}-discover`,
          personId: person.id,
          name: person.firstName || "Unnamed",
          when: person.discoveryAt,
          kind: "Discovery",
          host: person.discoveryHost,
        });
      }
      return rows;
    })
    .sort((a, b) => a.when.getTime() - b.when.getTime());

  const upcoming = items.filter((item) => item.when.getTime() >= Date.now() - 60 * 60 * 1000);
  const unassigned = upcoming.filter((item) => !item.host);

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 pb-28 pt-5">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">Times</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">New York</p>

      <section className="mt-8 space-y-6">
        {FOUNDERS.map((founder) => {
          const theirs = upcoming.filter((item) => item.host === founder.id);
          return (
            <div key={founder.id}>
              <h2 className="text-lg font-semibold text-[var(--ink)]">{founder.name}</h2>
              {theirs.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--muted)]">Nothing booked yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {theirs.map((item) => (
                    <Link
                      key={item.id}
                      href={`/admin/people/${item.personId}`}
                      className="block rounded-2xl bg-white px-4 py-3"
                    >
                      <p className="font-semibold text-[var(--ink)]">{item.name}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {item.kind} · {formatConsultationTime(item.when)}
                        {item.kind === "Consultation" ? (item.paid ? " · Paid" : " · Unpaid") : ""}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {unassigned.length > 0 ? (
          <div>
            <h2 className="text-lg font-semibold text-[var(--ink)]">Unassigned</h2>
            <div className="mt-3 space-y-2">
              {unassigned.map((item) => (
                <p key={item.id} className="text-sm text-[var(--muted)]">
                  {item.name} · {item.kind} · {formatConsultationTime(item.when)}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Your hours</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Nothing is open until you tap it on.</p>
        <div className="mt-4 rounded-3xl bg-white px-4 py-5">
          <HoursEditor initial={hours} />
        </div>
      </section>
    </main>
  );
}
