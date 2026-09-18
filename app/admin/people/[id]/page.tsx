import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NudgeButton } from "@/app/admin/people/[id]/NudgeButton";
import { DeletePersonButton } from "@/app/admin/DeletePersonButton";
import { MatchingDetailsEditor } from "@/app/admin/people/[id]/MatchingDetailsEditor";
import { PersonPhoto } from "@/app/admin/people/[id]/PersonPhoto";
import { ClientToggle } from "@/app/admin/people/[id]/ClientToggle";
import { ClientNotesEditor } from "@/app/admin/people/[id]/ClientNotesEditor";
import { ContactActions } from "@/app/admin/people/[id]/ContactActions";
import { HowHeardEditor } from "@/app/admin/people/[id]/HowHeardEditor";
import type { PersonWithDetails, ProfileAnswers } from "@/lib/types";

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return null;
  return (
    <div className="py-3">
      <dt className="text-sm font-semibold text-[var(--ink)]">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--muted)]">
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
    { label: "Name", value: person.firstName },
    { label: "Birthday", value: person.dateOfBirth },
    { label: "Gender", value: person.gender },
    { label: "Email", value: person.email },
    { label: "Partner age", value: profile?.partnerAgeRange },
    { label: "Everyday life", value: profile?.everydayLife },
    { label: "Religiosity", value: profile?.religiosity },
    { label: "Partner religiosity", value: profile?.partnerReligiosity },
    { label: "Family", value: profile?.familyBackground },
    { label: "Self", value: profile?.selfDescription },
    { label: "Looking for", value: profile?.partnerQualities },
    { label: "Non-negotiables", value: profile?.nonNegotiables },
    { label: "Physical", value: profile?.physicalAttracted },
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
      referredBy: true,
      referrals: { orderBy: { createdAt: "desc" } },
      adminAnswers: { orderBy: { createdAt: "asc" } },
    },
  })) as PersonWithDetails | null;
  if (!person) notFound();

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
        {person.photoUrl ? (
          <PersonPhoto src={person.photoUrl} name={person.firstName || "Unnamed"} />
        ) : (
          <div className="flex min-h-56 items-center justify-center bg-[var(--accent-soft)] text-5xl font-semibold text-[var(--accent)]">
            {(person.firstName || "?").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="p-4">
          <div className="mb-4">
            <ClientToggle
              personId={person.id}
              isClient={person.isClient}
              consultationAt={person.consultationAt?.toISOString() || null}
            />
          </div>
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
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-700">
                {statusLabel(person.status)}
              </span>
              {person.isClient ? (
                <span className="rounded-full bg-[var(--ink)] px-2.5 py-1 text-[11px] font-medium text-white">
                  Client
                </span>
              ) : null}
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <ContactActions
              personId={person.id}
              phone={person.phone}
              email={person.email}
              firstName={person.firstName}
            />
            {person.consultationCheckoutUrl ? (
              <p>
                <a
                  href={person.consultationCheckoutUrl}
                  className="text-[var(--accent)]"
                  target="_blank"
                  rel="noreferrer"
                >
                  {person.consultationPaidAt ? "Paid" : "Pay link"}
                </a>
              </p>
            ) : null}
            {person.referredBy ? (
              <p className="text-[var(--muted)]">
                Referred by{" "}
                <Link href={`/admin/people/${person.referredBy.id}`} className="text-[var(--accent)]">
                  {person.referredBy.firstName || person.referredBy.phone}
                </Link>
              </p>
            ) : null}
            {person.referralCount > 0 || person.referralCode ? (
              <p className="text-[var(--muted)]">
                {person.referralCount} referral{person.referralCount === 1 ? "" : "s"}
                {person.referralCode ? ` · ${person.referralCode}` : ""}
              </p>
            ) : null}
            {person.referrals && person.referrals.length > 0 ? (
              <p className="text-[var(--muted)]">
                Referred{" "}
                {person.referrals
                  .slice(0, 8)
                  .map((referral) => referral.firstName || referral.phone)
                  .join(", ")}
                {person.referrals.length > 8 ? "…" : ""}
              </p>
            ) : null}
            {person.adminAnswers && person.adminAnswers.length > 0 ? (
              <div className="space-y-3">
                {person.adminAnswers.map((item) => (
                  <div key={item.id}>
                    <p className="text-sm font-semibold text-[var(--ink)]">{item.questionText}</p>
                    <p className="mt-1 whitespace-pre-wrap text-[15px] text-[var(--muted)]">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <HowHeardEditor
                personId={person.id}
                initial={person.howHeard || ""}
                referredByName={person.referredBy?.firstName || person.referredBy?.phone || null}
              />
            )}
            {person.resumeUrl ? (
              <p>
                <a href={person.resumeUrl} className="text-[var(--accent)]" target="_blank" rel="noreferrer">
                  View resume
                </a>
              </p>
            ) : null}
          </div>
          {person.status === "in_progress" ? (
            <div className="mt-4">
              <NudgeButton
                personId={person.id}
                lastNudgedAt={person.lastNudgedAt?.toISOString() || null}
              />
            </div>
          ) : null}
        </div>
      </section>

      <div className="mt-4 space-y-3">
        {person.isClient ? (
          <ClientNotesEditor
            personId={person.id}
            initial={{
              consultationNotes: profile?.consultationNotes || "",
              clientLookingFor: profile?.clientLookingFor || "",
              clientNonNegotiables: profile?.clientNonNegotiables || "",
              date1Feedback: profile?.date1Feedback || "",
              date2Feedback: profile?.date2Feedback || "",
              date3Feedback: profile?.date3Feedback || "",
            }}
          />
        ) : (
        <Section title="Intake" defaultOpen>
          <dl className="divide-y divide-[var(--line)]">
            {answers.map((item) => (
              <Field key={item.label} label={item.label} value={item.value} />
            ))}
            {answeredCount === 0 ? (
              <p className="py-3 text-sm text-[var(--muted)]">None yet.</p>
            ) : null}
          </dl>
        </Section>
        )}

        <Section title="Notes">
          <Link
            href={`/admin/matches/create?personA=${person.id}`}
            className="my-3 block rounded-2xl bg-[var(--accent)] px-4 py-3 text-center text-sm font-medium text-white"
          >
            Match
          </Link>
          <div className="border-t border-[var(--line)] pt-3">
            <MatchingDetailsEditor
              personId={person.id}
              initial={{
                partnerAgeRange: profile?.partnerAgeRange || "",
                relocationFlexibility: profile?.relocationFlexibility || "",
                hasChildren: profile?.hasChildren || "",
                openToPartnerChildren: profile?.openToPartnerChildren || "",
                smokingBoundaries: profile?.smokingBoundaries || "",
                marriageTimeline: profile?.marriageTimeline || "",
                fiveYearLife: profile?.fiveYearLife || "",
                lifestyle: profile?.lifestyle || "",
                matchmakerEligibilityNotes: profile?.matchmakerEligibilityNotes || "",
              }}
            />
          </div>
        </Section>

        <Section title="Chat">
          <div className="space-y-3 py-3">
            {person.messages.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">None yet.</p>
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

        {!person.isClient && extras.length > 0 ? (
          <Section title="More">
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
