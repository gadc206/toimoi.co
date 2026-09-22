import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { personGenderCategory } from "@/lib/admin/person-gender";
import { adminPeopleHref } from "@/lib/admin/query";
import { StartOutreachForm } from "@/app/admin/StartOutreachForm";
import { LogoutButton } from "@/app/admin/LogoutButton";
import type { PersonWithProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  status?: string;
  gender?: string;
  client?: string;
  q?: string;
}>;

function statusLabel(status: string) {
  if (status === "in_progress") return "In progress";
  if (status === "complete") return "Complete";
  if (status === "opted_out") return "Opted out";
  if (status === "paused") return "Paused";
  return status;
}

function statusTone(status: string) {
  if (status === "complete") return "bg-emerald-100 text-emerald-900";
  if (status === "in_progress") return "bg-amber-100 text-amber-900";
  if (status === "paused") return "bg-slate-100 text-slate-700";
  if (status === "opted_out") return "bg-rose-100 text-rose-900";
  return "bg-stone-100 text-stone-700";
}

function PersonCard({ person: p }: { person: PersonWithProfile }) {
  return (
    <Link
      href={`/admin/people/${p.id}`}
      className="flex items-center gap-3 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-3 active:scale-[0.99]"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--accent-soft)]">
        {p.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photoUrl} alt="" className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-[var(--accent)]">
            {(p.firstName || "?").slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="truncate text-lg font-semibold text-[var(--ink)]">
            {p.firstName || "Unnamed"}
            {p.age ? `, ${p.age}` : ""}
          </h2>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusTone(p.status)}`}>
              {statusLabel(p.status)}
            </span>
            {p.isClient ? (
              <span className="rounded-full bg-[var(--ink)] px-2 py-0.5 text-[10px] font-medium text-white">
                Client
              </span>
            ) : null}
            {p.listPriority > 0 ? (
              <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-medium text-white">
                Moved up
              </span>
            ) : null}
          </div>
        </div>
        <p className="mt-0.5 truncate text-sm text-[var(--muted)]">
          {[p.gender, p.profile?.location].filter(Boolean).join(" · ") || p.phone}
        </p>
        {p.referralCount > 0 ? (
          <p className="mt-0.5 text-xs text-[var(--accent)]">
            {p.referralCount} referral{p.referralCount === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const params = await searchParams;
  const people = (await prisma.person.findMany({
    include: { profile: true },
    orderBy: [
      { listPriority: "desc" },
      { listBoostedAt: { sort: "desc", nulls: "last" } },
      { updatedAt: "desc" },
    ],
  })) as PersonWithProfile[];

  await prisma.ensureMatchmakers();

  const filtered = people.filter((p) => {
    if (params.client === "1" && !p.isClient) return false;
    if (params.status && p.status !== params.status) return false;

    if (params.gender === "men" && personGenderCategory(p.gender) !== "men") {
      return false;
    }
    if (params.gender === "women" && personGenderCategory(p.gender) !== "women") {
      return false;
    }

    if (params.q) {
      const q = params.q.toLowerCase();
      const hay = [
        p.firstName,
        p.email,
        p.phone,
        p.gender,
        p.profile?.everydayLife,
        p.profile?.location,
        p.profile?.religiosity,
        p.howHeard,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const counts = {
    all: people.length,
    in_progress: people.filter((p) => p.status === "in_progress").length,
    complete: people.filter((p) => p.status === "complete").length,
    men: people.filter((p) => personGenderCategory(p.gender) === "men").length,
    women: people.filter((p) => personGenderCategory(p.gender) === "women").length,
    clients: people.filter((p) => p.isClient).length,
  };

  const filterTabs = [
    {
      kind: "all" as const,
      key: "",
      label: "All",
      count: counts.all,
    },
    {
      kind: "status" as const,
      key: "in_progress",
      label: "In progress",
      count: counts.in_progress,
    },
    {
      kind: "status" as const,
      key: "complete",
      label: "Complete",
      count: counts.complete,
    },
    {
      kind: "gender" as const,
      key: "men",
      label: "Men",
      count: counts.men,
    },
    {
      kind: "gender" as const,
      key: "women",
      label: "Women",
      count: counts.women,
    },
    {
      kind: "client" as const,
      key: "1",
      label: "Clients",
      count: counts.clients,
    },
  ];

  const queryState = {
    status: params.status,
    gender: params.gender,
    client: params.client,
    q: params.q,
  };

  function tabHref(tab: (typeof filterTabs)[number]) {
    if (tab.kind === "all") {
      return adminPeopleHref({ q: params.q });
    }
    if (tab.kind === "status") {
      return adminPeopleHref({
        ...queryState,
        status: tab.key,
        gender: undefined,
        client: undefined,
      });
    }
    if (tab.kind === "client") {
      return adminPeopleHref({
        ...queryState,
        status: undefined,
        gender: undefined,
        client: tab.key,
      });
    }
    return adminPeopleHref({
      ...queryState,
      status: undefined,
      gender: tab.key,
      client: undefined,
    });
  }

  function tabActive(tab: (typeof filterTabs)[number]) {
    if (tab.kind === "all") {
      return !params.status && !params.gender && params.client !== "1";
    }
    if (tab.kind === "status") {
      return params.status === tab.key && params.client !== "1";
    }
    if (tab.kind === "client") {
      return params.client === "1";
    }
    return params.gender === tab.key && params.client !== "1";
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 pb-28 pt-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">People</h1>
        <LogoutButton />
      </header>

      <nav className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href="/admin/consultations"
          className="rounded-2xl border border-[var(--line)] bg-white px-3 py-3 text-center text-sm font-medium text-[var(--ink)]"
        >
          Consultations
        </Link>
        <Link
          href="/admin/matches"
          className="rounded-2xl border border-[var(--line)] bg-white px-3 py-3 text-center text-sm font-medium text-[var(--accent)]"
        >
          Matches
        </Link>
        <Link
          href="/admin/people/new"
          className="rounded-2xl border border-[var(--line)] bg-white px-3 py-3 text-center text-sm font-medium text-[var(--ink)]"
        >
          Add person
        </Link>
        <Link
          href="/admin/matches/create"
          className="rounded-2xl bg-[var(--accent)] px-3 py-3 text-center text-sm font-medium text-white"
        >
          Create match
        </Link>
      </nav>

      <form className="mt-5" action="/admin" method="get">
        <input
          name="q"
          defaultValue={params.q || ""}
          placeholder="Search"
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base outline-none focus:border-[var(--accent)]"
        />
        {params.status ? <input type="hidden" name="status" value={params.status} /> : null}
        {params.gender ? <input type="hidden" name="gender" value={params.gender} /> : null}
        {params.client ? <input type="hidden" name="client" value={params.client} /> : null}
      </form>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => {
          const active = tabActive(tab);
          const isGender = tab.kind === "gender";
          return (
            <Link
              key={`${tab.kind}-${tab.key || "all"}`}
              href={tabHref(tab)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
                active
                  ? isGender
                    ? "bg-[var(--ink)] text-white"
                    : "bg-[var(--accent)] text-white"
                  : "border border-[var(--line)] bg-white text-[var(--ink)]"
              }`}
            >
              {tab.label} {tab.count}
            </Link>
          );
        })}
      </div>

      {(() => {
        const movedUp = filtered.filter((p) => p.listPriority > 0);
        const rest = filtered.filter((p) => p.listPriority <= 0);
        return (
          <>
            {movedUp.length > 0 ? (
              <section className="mt-5">
                <h2 className="mb-3 text-sm font-semibold text-[var(--ink)]">Moved up</h2>
                <div className="space-y-3">
                  {movedUp.map((p) => (
                    <PersonCard key={p.id} person={p} />
                  ))}
                </div>
              </section>
            ) : null}

            <section className={movedUp.length > 0 ? "mt-8" : "mt-5"}>
              {movedUp.length > 0 ? (
                <h2 className="mb-3 text-sm font-semibold text-[var(--ink)]">Everyone else</h2>
              ) : null}
              <div className="space-y-3">
                {rest.map((p) => (
                  <PersonCard key={p.id} person={p} />
                ))}
              </div>
            </section>
          </>
        );
      })()}

      {filtered.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-[var(--line)] bg-white/60 px-5 py-10 text-center text-[var(--muted)]">
          No people yet.
        </div>
      ) : null}

      <section className="mt-8">
        <StartOutreachForm />
      </section>
    </main>
  );
}
