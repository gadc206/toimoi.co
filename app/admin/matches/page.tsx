import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCalibrationReport } from "@/lib/matching/calibration";
import type { MatchWithDetails } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  status?: string;
  matchmaker?: string;
  q?: string;
}>;

function statusTone(status: string) {
  if (status === "engaged" || status === "married") return "bg-emerald-100 text-emerald-900";
  if (status === "dating") return "bg-sky-100 text-sky-900";
  if (status === "closed") return "bg-stone-200 text-stone-700";
  if (status === "paused") return "bg-amber-100 text-amber-900";
  return "bg-[var(--accent-soft)] text-[var(--accent)]";
}

export default async function MatchesPage({ searchParams }: { searchParams: SearchParams }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const params = await searchParams;
  const [allMatches, matchmakers, calibration] = await Promise.all([
    prisma.match.findMany({
      where: {
        status: params.status,
        matchmakerId: params.matchmaker,
      },
      include: { details: true },
    }),
    prisma.matchmaker.findMany(),
    getCalibrationReport(),
  ]);
  const matches = (allMatches as MatchWithDetails[]).filter((match) => {
    if (!params.q) return true;
    const query = params.q.toLowerCase();
    return [
      match.personA.firstName,
      match.personB.firstName,
      match.personA.phone,
      match.personB.phone,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 pb-24 pt-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">TOIMOI</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            Matches
          </h1>
        </div>
        <Link
          href="/admin/matches/create"
          className="rounded-2xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white"
        >
          Create Match
        </Link>
      </header>

      <nav className="mt-4 flex gap-2">
        <Link
          href="/admin"
          className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm"
        >
          People
        </Link>
        <span className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-white">
          Matches {matches.length}
        </span>
      </nav>

      <details className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium capitalize">
          Engine: {calibration.mode} mode
        </summary>
        <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{calibration.policy}</p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {calibration.reviews} reviews · {calibration.bilateralOutcomes} bilateral outcomes ·{" "}
          {calibration.secondDates} second dates
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {calibration.shadowRuns} ranking comparisons ·{" "}
          {calibration.pairwiseAgreement == null
            ? "agreement pending"
            : `${Math.round(calibration.pairwiseAgreement * 100)}% pairwise agreement`}{" "}
          · {calibration.falseExclusions} legacy-only candidates flagged for review
        </p>
      </details>

      <form className="mt-5 grid grid-cols-2 gap-2">
        <input
          name="q"
          defaultValue={params.q || ""}
          placeholder="Search either person…"
          className="col-span-2 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
        />
        <select
          name="matchmaker"
          defaultValue={params.matchmaker || ""}
          className="rounded-2xl border border-[var(--line)] bg-white px-3 py-3 text-sm"
        >
          <option value="">All matchmakers</option>
          {matchmakers.map((matchmaker) => (
            <option key={matchmaker.id} value={matchmaker.id}>
              {matchmaker.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={params.status || ""}
          className="rounded-2xl border border-[var(--line)] bg-white px-3 py-3 text-sm"
        >
          <option value="">All statuses</option>
          {["approved", "proposed", "dating", "paused", "closed", "engaged", "married"].map(
            (status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ),
          )}
        </select>
        <button
          type="submit"
          className="col-span-2 rounded-2xl border border-[var(--accent)] px-4 py-2 text-sm text-[var(--accent)]"
        >
          Apply filters
        </button>
      </form>

      <section className="mt-5 space-y-3">
        {matches.map((match) => (
          <Link
            key={match.id}
            href={`/admin/matches/${match.id}`}
            className="block rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">
                  {match.personA.firstName || match.personA.phone}
                  <span className="mx-2 text-[var(--muted)]">+</span>
                  {match.personB.firstName || match.personB.phone}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {match.matchmaker.name} · {match.source === "manual" ? "Human pick" : "AI suggestion"}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs capitalize ${statusTone(
                  match.status,
                )}`}
              >
                {match.status}
              </span>
            </div>
            {match.assessment ? (
              <p className="mt-3 text-sm">
                <span className="font-medium capitalize">{match.assessment.fitBand}</span>
                <span className="text-[var(--muted)]">
                  {" "}
                  · score {match.assessment.score} · {Math.round(match.assessment.confidence * 100)}%
                  evidence
                </span>
              </p>
            ) : null}
          </Link>
        ))}
        {matches.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--line)] bg-white/60 px-5 py-10 text-center">
            <p className="text-[var(--muted)]">No matches found.</p>
            <Link
              href="/admin/matches/create"
              className="mt-3 inline-block font-medium text-[var(--accent)]"
            >
              Create the first match
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
