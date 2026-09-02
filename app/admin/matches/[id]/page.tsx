import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type {
  EvidenceRef,
  MatchReason,
  MatchWithDetails,
  StoredMatchAssessment,
} from "@/lib/types";
import { MatchActions } from "@/app/admin/matches/[id]/MatchActions";
import { RecalculateButton } from "@/app/admin/matches/[id]/RecalculateButton";

export const dynamic = "force-dynamic";

function ReasonList({
  reasons,
  names,
}: {
  reasons: MatchReason[];
  names: Record<string, string>;
}) {
  if (!reasons.length) return <p className="text-sm text-[var(--muted)]">No supported items yet.</p>;
  return (
    <ul className="space-y-2">
      {reasons.map((reason, index) => (
        <li key={`${reason.label}-${index}`} className="rounded-2xl border border-[var(--line)] bg-white p-3">
          <p className="text-sm font-medium">{reason.label}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{reason.detail}</p>
          {reason.evidence.map((item: EvidenceRef, evidenceIndex) => (
            <blockquote
              key={`${item.personId}-${item.field}-${evidenceIndex}`}
              className="mt-2 border-l-2 border-[var(--accent-soft)] pl-2 text-xs text-[var(--muted)]"
            >
              {names[item.personId] || "Profile"} · {item.field}: “{item.quote}”
            </blockquote>
          ))}
        </li>
      ))}
    </ul>
  );
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const match = (await prisma.match.findUnique({
    where: { id },
    include: { details: true },
  })) as MatchWithDetails | null;
  if (!match) notFound();
  const history = (await prisma.matchAssessment.findManyForPair({
    personAId: match.personAId,
    personBId: match.personBId,
  })) as StoredMatchAssessment[];
  const names = {
    [match.personA.id]: match.personA.firstName || match.personA.phone,
    [match.personB.id]: match.personB.firstName || match.personB.phone,
  };
  const assessment = match.assessment;

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

      <header className="mt-5 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
          {match.source === "manual" ? "Human pick" : "AI suggestion"} · {match.matchmaker.name}
        </p>
        <h1 className="mt-1 text-2xl font-semibold">
          <Link href={`/admin/people/${match.personA.id}`} className="text-[var(--accent)]">
            {names[match.personA.id]}
          </Link>
          <span className="mx-2 text-[var(--muted)]">+</span>
          <Link href={`/admin/people/${match.personB.id}`} className="text-[var(--accent)]">
            {names[match.personB.id]}
          </Link>
        </h1>
        <p className="mt-2 text-sm capitalize text-[var(--muted)]">
          Status: {match.status} · created {match.createdAt.toLocaleDateString()}
        </p>
        {match.overrideNote ? (
          <p className="mt-3 rounded-2xl bg-amber-100 px-3 py-2 text-sm text-amber-900">
            Override: {match.overrideNote}
          </p>
        ) : null}
      </header>

      {assessment ? (
        <div className="mt-4 space-y-3">
          <section className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Current assessment</p>
                <h2 className="mt-1 text-2xl font-semibold capitalize">{assessment.fitBand} fit</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Eligibility: {assessment.eligibility.replace("_", " ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold">{assessment.score}</p>
                <p className="text-xs text-[var(--muted)]">
                  {Math.round(assessment.confidence * 100)}% evidence
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
              <p className="text-xs text-[var(--muted)]">{assessment.algorithmVersion}</p>
              <RecalculateButton matchId={match.id} />
            </div>
          </section>

          <details open className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <summary className="cursor-pointer font-semibold">Strengths</summary>
            <div className="mt-3">
              <ReasonList reasons={assessment.strengths} names={names} />
            </div>
          </details>

          <details className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <summary className="cursor-pointer font-semibold">Potential healthy balances</summary>
            <div className="mt-3">
              <ReasonList reasons={assessment.complements} names={names} />
            </div>
          </details>

          <details className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <summary className="cursor-pointer font-semibold">Cautions and unknowns</summary>
            <div className="mt-3 space-y-4">
              <ReasonList reasons={assessment.cautions} names={names} />
              <ReasonList reasons={assessment.unknowns} names={names} />
            </div>
          </details>

          <details className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <summary className="cursor-pointer font-semibold">Two-way evidence</summary>
            <div className="mt-3 space-y-5">
              <div>
                <h3 className="mb-2 text-sm font-medium">
                  What {names[match.personB.id]} may offer {names[match.personA.id]}
                </h3>
                <ReasonList reasons={assessment.directionAtoB} names={names} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium">
                  What {names[match.personA.id]} may offer {names[match.personB.id]}
                </h3>
                <ReasonList reasons={assessment.directionBtoA} names={names} />
              </div>
            </div>
          </details>

          <details className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <summary className="cursor-pointer font-semibold">Why not higher?</summary>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted)]">
              {assessment.whyNotHigher.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </details>

          <details className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <summary className="cursor-pointer font-semibold">Requirement checks</summary>
            <div className="mt-3 space-y-2">
              {assessment.gates.map((gate) => (
                <div key={gate.key} className="rounded-2xl border border-[var(--line)] bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{gate.label}</p>
                    <span className="text-xs capitalize text-[var(--muted)]">
                      {gate.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{gate.detail}</p>
                </div>
              ))}
            </div>
          </details>
        </div>
      ) : null}

      <section className="mt-4 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <h2 className="font-semibold">Dating timeline</h2>
        <ol className="mt-3 space-y-3">
          {match.outcomes.map((outcome) => (
            <li key={outcome.id} className="border-l-2 border-[var(--accent-soft)] pl-3">
              <p className="text-sm font-medium capitalize">{outcome.stage.replace("_", " ")}</p>
              <p className="text-xs text-[var(--muted)]">{outcome.occurredAt.toLocaleString()}</p>
              {outcome.personAResponse || outcome.personBResponse ? (
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {[outcome.personAResponse, outcome.personBResponse].filter(Boolean).join(" · ")}
                </p>
              ) : null}
              {outcome.notes ? <p className="mt-1 text-sm">{outcome.notes}</p> : null}
            </li>
          ))}
          {match.outcomes.length === 0 ? (
            <li className="text-sm text-[var(--muted)]">No outcomes recorded yet.</li>
          ) : null}
        </ol>
      </section>

      <section className="mt-4 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <h2 className="font-semibold">Assessment history</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {history.map((item) => (
            <li key={item.id} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2">
              <span className="capitalize">
                {item.fitBand} · {item.score}
              </span>
              <span className="text-xs text-[var(--muted)]">{item.createdAt.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-4">
        <MatchActions matchId={match.id} initialStatus={match.status} initialNotes={match.notes} />
      </div>
    </main>
  );
}
