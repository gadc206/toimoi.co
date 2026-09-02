import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Matchmaker, PersonWithProfile } from "@/lib/types";
import { CreateMatchForm } from "@/app/admin/matches/create/CreateMatchForm";

export const dynamic = "force-dynamic";

export default async function CreateMatchPage({
  searchParams,
}: {
  searchParams: Promise<{ personA?: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const query = await searchParams;
  const [people, matchmakers] = (await Promise.all([
    prisma.person.findMany({
      include: { profile: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.matchmaker.findMany(),
  ])) as [PersonWithProfile[], Matchmaker[]];

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 pb-24 pt-5">
      <nav className="flex items-center justify-between gap-3">
        <Link href="/admin/matches" className="text-sm text-[var(--accent)]">
          ← Matches
        </Link>
        <Link href="/admin" className="text-sm text-[var(--accent)]">
          People
        </Link>
      </nav>
      <header className="mt-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">TOIMOI</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)]">
          Create Match
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Vanessa or Noga can choose any two people. TOIMOI checks requirements, but the
          matchmaker makes the final decision.
        </p>
      </header>
      <CreateMatchForm
        people={people.map((person) => ({
          id: person.id,
          name: person.firstName || person.phone,
          age: person.age,
          gender: person.gender,
          location: person.profile?.location || null,
          status: person.status,
        }))}
        matchmakers={matchmakers.map((matchmaker) => ({
          id: matchmaker.id,
          name: matchmaker.name,
        }))}
        initialPersonAId={query.personA || ""}
      />
    </main>
  );
}
