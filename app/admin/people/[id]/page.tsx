import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { suggestMatches } from "@/lib/matching";
import { NudgeButton } from "@/app/admin/people/[id]/NudgeButton";
import { SuggestionReview } from "@/app/admin/people/[id]/SuggestionReview";
import { MatchingDetailsEditor } from "@/app/admin/people/[id]/MatchingDetailsEditor";
import type { Matchmaker, PersonWithDetails } from "@/lib/types";

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return null;
  return (
    <div className="py-3">
      <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--ink)]">
        {String(value)}
      </dd>
    </div>
  );
}

function Section({
  title,
  children,
  highlight = false,
}: {
  title: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <details
      className={`rounded-3xl border border-[var(--line)] p-4 ${
        highlight ? "bg-[var(--accent-soft)]/35" : "bg-[var(--panel)]"
      }`}
    >
      <summary className="cursor-pointer list-none text-base font-semibold text-[var(--ink)] [&::-webkit-details-marker]:hidden">
        {title}
        <span className="float-right text-[var(--muted)]">▸</span>
      </summary>
      <dl className="mt-2 divide-y divide-[var(--line)]">{children}</dl>
    </details>
  );
}

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { id } = await params;

  const person = (await prisma.person.findUnique({
    where: { id },
    include: {
      profile: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  })) as PersonWithDetails | null;
  if (!person) notFound();

  const matches = person.status === "complete" ? await suggestMatches(person.id) : [];
  const matchmakers = (await prisma.matchmaker.findMany()) as Matchmaker[];
  const p = person.profile;

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 pb-24 pt-5">
      <Link href="/admin" className="text-sm text-[var(--accent)]">
        ← People
      </Link>

      <section className="mt-4 overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)]">
        <div className="aspect-[4/3] bg-[var(--accent-soft)]">
          {person.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={person.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl font-semibold text-[var(--accent)]">
              {(person.firstName || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="p-4">
          <h1 className="text-3xl font-semibold text-[var(--ink)]">
            {person.firstName || "Unnamed"}
            {person.age ? `, ${person.age}` : ""}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {[person.gender, person.dateOfBirth ? `born ${person.dateOfBirth}` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="mt-4 space-y-1 text-sm">
            <p>
              <span className="text-[var(--muted)]">Phone </span>
              <a href={`tel:${person.phone}`} className="text-[var(--accent)]">
                {person.phone}
              </a>
            </p>
            {person.email ? (
              <p>
                <span className="text-[var(--muted)]">Email </span>
                <a href={`mailto:${person.email}`} className="text-[var(--accent)]">
                  {person.email}
                </a>
              </p>
            ) : null}
            <p className="text-[var(--muted)]">
              {person.status} · {person.currentStep}
            </p>
          </div>
          <div className="mt-4">
            <NudgeButton personId={person.id} />
          </div>
        </div>
      </section>

      <div className="mt-4 space-y-3">
        <Section title="Basics" highlight>
          <Field label="1. Full name" value={person.firstName} />
          <Field label="2. Date of birth" value={person.dateOfBirth} />
          <Field label="Age" value={person.age} />
          <Field label="3. Gender" value={person.gender} />
          <Field label="4. Email" value={person.email} />
          <Field label="5. Partner age range" value={p?.partnerAgeRange} />
        </Section>

        <Section title="Questions 6-16" highlight>
          <Field
            label="6. Where they live, everyday life, and relocating"
            value={p?.everydayLife}
          />
          <Field label="7. Religiously today" value={p?.religiosity} />
          <Field
            label="8. What they want religiously in a partner"
            value={p?.partnerReligiosity}
          />
          <Field
            label="9. Ashkenazi, Sephardi, or both"
            value={p?.familyBackground}
          />
          <Field
            label="10. How they want to be understood"
            value={p?.selfDescription}
          />
          <Field
            label="11. Three most important things in the person they marry"
            value={p?.partnerQualities}
          />
          <Field label="12. Cannot compromise on" value={p?.nonNegotiables} />
          <Field
            label="13. What dating taught them"
            value={p?.datingLesson}
          />
          <Field label="14. What attraction means" value={p?.attractionMeaning} />
          <Field
            label="15. Marriage and home in 5 years"
            value={p?.fiveYearLife}
          />
          <Field label="16. What being ready means" value={p?.readiness} />
        </Section>

        <Section title="Background & family">
          <Field label="Family background" value={p?.familyBackground} />
          <Field label="Mom" value={p?.momBackground} />
          <Field label="Dad" value={p?.dadBackground} />
          <Field label="Dating preference" value={p?.datingBackgroundPreference} />
          <Field label="Family closeness" value={p?.familyCloseness} />
          <Field label="Bring into marriage" value={p?.bringIntoMarriage} />
          <Field label="Do differently" value={p?.doDifferently} />
        </Section>

        <Section title="Religion & community">
          <Field label="Direction" value={p?.religiosityDirection} />
          <Field label="Partner religiosity" value={p?.partnerReligiosity} />
          <Field label="Future home" value={p?.futureHomeReligious} />
          <Field label="Community importance" value={p?.communityImportance} />
          <Field label="Judaism for children" value={p?.judaismForChildren} />
        </Section>

        <Section title="Who they are">
          <Field label="Three words" value={p?.threeWords} />
          <Field label="Hidden side" value={p?.hiddenSide} />
          <Field label="Hobbies" value={p?.hobbies} />
          <Field label="Social style" value={p?.socialStyle} />
          <Field label="Perfect Sunday" value={p?.perfectSunday} />
          <Field label="Love language (receive)" value={p?.loveLanguageReceive} />
          <Field label="Love language (give)" value={p?.loveLanguageGive} />
        </Section>

        <Section title="Needs & matching" highlight>
          <Field label="Core emotional needs" value={p?.coreEmotionalNeeds} />
          <Field label="Non-negotiables" value={p?.nonNegotiables} />
          <Field label="Partner qualities" value={p?.partnerQualities} />
          <Field label="Personality attracted" value={p?.personalityAttracted} />
          <Field label="Physical attracted" value={p?.physicalAttracted} />
          <Field label="Growth edge" value={p?.growthEdge} />
          <Field label="Do differently next" value={p?.doDifferentlyNext} />
        </Section>

        <Section title="Practical requirements" highlight>
          <MatchingDetailsEditor
            personId={person.id}
            initial={{
              partnerAgeRange: p?.partnerAgeRange || "",
              relocationFlexibility: p?.relocationFlexibility || "",
              hasChildren: p?.hasChildren || "",
              openToPartnerChildren: p?.openToPartnerChildren || "",
              smokingBoundaries: p?.smokingBoundaries || "",
              marriageTimeline: p?.marriageTimeline || "",
              matchmakerEligibilityNotes: p?.matchmakerEligibilityNotes || "",
            }}
          />
        </Section>

        <Section title="Coaching notes" highlight>
          <Field label="Dating lesson" value={p?.datingLesson} />
          <Field label="Type pattern" value={p?.typeInCommon} />
          <Field label="Mirror reflection" value={p?.mirrorReflection} />
          <Field label="Mindset shift" value={p?.mindsetShift} />
          <Field label="Best friend description" value={p?.bestFriendDescription} />
        </Section>

        <Section title="Suggested matches">
          <Link
            href={`/admin/matches/create?personA=${person.id}`}
            className="my-2 block rounded-2xl bg-[var(--accent)] px-4 py-3 text-center text-sm font-medium text-white"
          >
            Manually match {person.firstName || "this person"}
          </Link>
          {matches.length === 0 ? (
            <p className="py-3 text-sm text-[var(--muted)]">
              {person.status === "complete"
                ? "No compatible completed profiles yet."
                : "Matches appear after this profile is complete."}
            </p>
          ) : (
            <ul className="space-y-3 py-2">
              {matches.map((m) => (
                <li
                  key={m.person.id}
                  className="rounded-2xl border border-[var(--line)] bg-white p-3"
                >
                  <Link href={`/admin/people/${m.person.id}`} className="block">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-[var(--accent)]">
                        {m.person.firstName || m.person.phone}
                      </span>
                      <span className="text-right text-xs text-[var(--muted)]">
                        <span className="block capitalize">{m.assessment.fitBand}</span>
                        <span>
                          {m.score} · {Math.round(m.assessment.confidence * 100)}% evidence
                        </span>
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {m.reasons.slice(0, 2).join(" · ") || "Open to review the evidence."}
                    </p>
                  </Link>
                  <details className="mt-2 text-sm">
                    <summary className="cursor-pointer text-xs font-medium text-[var(--accent)]">
                      Evidence, cautions, and why not higher
                    </summary>
                    <div className="mt-2 space-y-3 text-xs">
                      <div>
                        <p className="font-medium">Strengths</p>
                        <ul className="mt-1 list-disc space-y-1 pl-4 text-[var(--muted)]">
                          {m.assessment.strengths.map((reason) => (
                            <li key={`${reason.label}-${reason.detail}`}>{reason.detail}</li>
                          ))}
                        </ul>
                      </div>
                      {m.assessment.complements.length ? (
                        <div>
                          <p className="font-medium">Potential balances</p>
                          <ul className="mt-1 list-disc space-y-1 pl-4 text-[var(--muted)]">
                            {m.assessment.complements.map((reason) => (
                              <li key={`${reason.label}-${reason.detail}`}>{reason.detail}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      <div>
                        <p className="font-medium">Cautions / unknowns</p>
                        <ul className="mt-1 list-disc space-y-1 pl-4 text-[var(--muted)]">
                          {[...m.assessment.cautions, ...m.assessment.unknowns]
                            .slice(0, 4)
                            .map((reason) => (
                              <li key={`${reason.label}-${reason.detail}`}>{reason.detail}</li>
                            ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">Why not higher?</p>
                        <ul className="mt-1 list-disc space-y-1 pl-4 text-[var(--muted)]">
                          {m.assessment.whyNotHigher.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>
                  <SuggestionReview
                    assessmentId={m.assessment.id}
                    eligibility={m.assessment.eligibility}
                    matchmakers={matchmakers.map((matchmaker) => ({
                      id: matchmaker.id,
                      name: matchmaker.name,
                    }))}
                  />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="WhatsApp transcript">
          <div className="space-y-3 py-3">
            {person.messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.direction === "inbound"
                    ? "border border-[var(--line)] bg-white"
                    : "ml-auto bg-[var(--accent)] text-white"
                }`}
              >
                {m.body}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}
