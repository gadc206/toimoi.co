import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { suggestMatches } from "@/lib/matching";
import { QUESTIONS } from "@/lib/toimo/copy";
import { NudgeButton } from "@/app/admin/people/[id]/NudgeButton";
import { DeletePersonButton } from "@/app/admin/DeletePersonButton";
import { SuggestionReview } from "@/app/admin/people/[id]/SuggestionReview";
import { MatchingDetailsEditor } from "@/app/admin/people/[id]/MatchingDetailsEditor";
import type { Matchmaker, PersonWithDetails, ProfileAnswers } from "@/lib/types";

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
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4"
    >
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-[var(--ink)]">{title}</p>
            {subtitle ? <p className="mt-0.5 text-sm text-[var(--muted)]">{subtitle}</p> : null}
          </div>
          <span className="shrink-0 pt-0.5 text-[var(--muted)]">▸</span>
        </div>
      </summary>
      <div className="mt-3 border-t border-[var(--line)]">{children}</div>
    </details>
  );
}

function intakeFields(person: PersonWithDetails, profile: ProfileAnswers | null) {
  return [
    { label: QUESTIONS.full_name, value: person.firstName },
    { label: QUESTIONS.date_of_birth, value: person.dateOfBirth },
    { label: QUESTIONS.gender, value: person.gender },
    { label: QUESTIONS.email, value: person.email },
    { label: QUESTIONS.partner_age_range, value: profile?.partnerAgeRange },
    { label: QUESTIONS.everyday_life, value: profile?.everydayLife },
    { label: QUESTIONS.religiosity, value: profile?.religiosity },
    { label: QUESTIONS.partner_religiosity, value: profile?.partnerReligiosity },
    { label: QUESTIONS.family_background, value: profile?.familyBackground },
    { label: QUESTIONS.self_description, value: profile?.selfDescription },
    { label: QUESTIONS.partner_qualities, value: profile?.partnerQualities },
    { label: QUESTIONS.non_negotiables, value: profile?.nonNegotiables },
    { label: QUESTIONS.physical_type, value: profile?.physicalAttracted },
  ];
}

function legacyNotes(profile: ProfileAnswers | null) {
  if (!profile) return [];

  return [
    { label: "Mom", value: profile.momBackground },
    { label: "Dad", value: profile.dadBackground },
    { label: "Dating background preference", value: profile.datingBackgroundPreference },
    { label: "Family closeness", value: profile.familyCloseness },
    { label: "Bring into marriage", value: profile.bringIntoMarriage },
    { label: "Do differently", value: profile.doDifferently },
    { label: "Religious direction", value: profile.religiosityDirection },
    { label: "Future home religiously", value: profile.futureHomeReligious },
    { label: "Community importance", value: profile.communityImportance },
    { label: "Judaism for children", value: profile.judaismForChildren },
    { label: "Three words", value: profile.threeWords },
    { label: "Hidden side", value: profile.hiddenSide },
    { label: "Hobbies", value: profile.hobbies },
    { label: "Social style", value: profile.socialStyle },
    { label: "Perfect Sunday", value: profile.perfectSunday },
    { label: "Love language (receive)", value: profile.loveLanguageReceive },
    { label: "Love language (give)", value: profile.loveLanguageGive },
    { label: "Core emotional needs", value: profile.coreEmotionalNeeds },
    { label: "Personality attracted to", value: profile.personalityAttracted },
    { label: "Growth edge", value: profile.growthEdge },
    { label: "Do differently next", value: profile.doDifferentlyNext },
    { label: "Dating lesson", value: profile.datingLesson },
    { label: "Type pattern", value: profile.typeInCommon },
    { label: "Mirror reflection", value: profile.mirrorReflection },
    { label: "Mindset shift", value: profile.mindsetShift },
    { label: "Best friend description", value: profile.bestFriendDescription },
  ].filter((item) => item.value != null && item.value !== "");
}

function statusLabel(status: string) {
  if (status === "in_progress") return "In progress";
  if (status === "complete") return "Complete";
  if (status === "opted_out") return "Opted out";
  if (status === "paused") return "Paused";
  return status;
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
  const profile = person.profile;
  const answers = intakeFields(person, profile);
  const answeredCount = answers.filter((item) => item.value != null && item.value !== "").length;
  const extras = legacyNotes(profile);

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
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold text-[var(--ink)]">
                {person.firstName || "Unnamed"}
                {person.age ? `, ${person.age}` : ""}
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {[person.gender, person.dateOfBirth ? `born ${person.dateOfBirth}` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-700">
              {statusLabel(person.status)}
            </span>
          </div>
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
              {answeredCount} of 13 intake answers · step {person.currentStep.replace(/_/g, " ")}
            </p>
          </div>
          {person.status === "in_progress" ? (
            <div className="mt-4">
              <NudgeButton personId={person.id} />
            </div>
          ) : null}
        </div>
      </section>

      <div className="mt-4 space-y-3">
        <Section
          title="Intake answers"
          subtitle={`${answeredCount} of 13 answered`}
          defaultOpen
        >
          <dl className="divide-y divide-[var(--line)]">
            {answers.map((item) => (
              <Field key={item.label} label={item.label} value={item.value} />
            ))}
            {answeredCount === 0 ? (
              <p className="py-3 text-sm text-[var(--muted)]">No intake answers yet.</p>
            ) : null}
          </dl>
        </Section>

        <Section
          title="AI suggested matches"
          subtitle={
            person.status !== "complete"
              ? "Available after intake is complete"
              : matches.length > 0
                ? `${matches.length} ranked ${matches.length === 1 ? "match" : "matches"} from the matching engine`
                : "No compatible completed profiles yet"
          }
          defaultOpen={person.status === "complete"}
        >
          {person.status !== "complete" ? (
            <p className="py-3 text-sm text-[var(--muted)]">
              Finish the WhatsApp intake first. AI matches run once a profile is marked complete.
            </p>
          ) : matches.length === 0 ? (
            <p className="py-3 text-sm text-[var(--muted)]">
              No compatible completed profiles yet. Add more people or check back when new profiles
              finish intake.
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

        <Section title="Matchmaker tools" subtitle="Manual matching and internal notes">
          <Link
            href={`/admin/matches/create?personA=${person.id}`}
            className="my-3 block rounded-2xl bg-[var(--accent)] px-4 py-3 text-center text-sm font-medium text-white"
          >
            Manually match {person.firstName || "this person"}
          </Link>

          <div className="border-t border-[var(--line)] pt-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-[var(--muted)]">
              Matchmaker notes
            </p>
            <MatchingDetailsEditor
              personId={person.id}
              initial={{
                partnerAgeRange: profile?.partnerAgeRange || "",
                relocationFlexibility: profile?.relocationFlexibility || "",
                hasChildren: profile?.hasChildren || "",
                openToPartnerChildren: profile?.openToPartnerChildren || "",
                smokingBoundaries: profile?.smokingBoundaries || "",
                marriageTimeline: profile?.marriageTimeline || "",
                matchmakerEligibilityNotes: profile?.matchmakerEligibilityNotes || "",
              }}
            />
          </div>
        </Section>

        <Section title="WhatsApp conversation" subtitle={`${person.messages.length} messages`}>
          <div className="space-y-3 py-3">
            {person.messages.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No messages yet.</p>
            ) : (
              person.messages.map((m) => (
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
              ))
            )}
          </div>
        </Section>

        {extras.length > 0 ? (
          <Section title="Additional notes" subtitle="Older or extra profile fields">
            <dl className="divide-y divide-[var(--line)]">
              {extras.map((item) => (
                <Field key={item.label} label={item.label} value={item.value} />
              ))}
            </dl>
          </Section>
        ) : null}
      </div>

      <section className="mt-8 border-t border-[var(--line)] pt-6">
        <DeletePersonButton personId={person.id} name={person.firstName} />
      </section>
    </main>
  );
}
