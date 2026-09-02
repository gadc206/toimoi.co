import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StartOutreachForm } from "@/app/admin/StartOutreachForm";
import { LogoutButton } from "@/app/admin/LogoutButton";
import type { PersonWithProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  status?: string;
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

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const params = await searchParams;
  const people = (await prisma.person.findMany({
    include: { profile: true },
    orderBy: { updatedAt: "desc" },
  })) as PersonWithProfile[];

  const filtered = people.filter((p) => {
    if (params.status && p.status !== params.status) return false;
    if (params.q) {
      const q = params.q.toLowerCase();
      const hay = [
        p.firstName,
        p.email,
        p.phone,
        p.profile?.location,
        p.profile?.synagogueName,
        p.profile?.work,
        p.profile?.religiosity,
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
  };

  const tabs = [
    { key: "", label: "All", count: counts.all },
    { key: "in_progress", label: "In progress", count: counts.in_progress },
    { key: "complete", label: "Complete", count: counts.complete },
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 pb-24 pt-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">TOIMOI</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)]">People</h1>
        </div>
        <LogoutButton />
      </header>

      <nav className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href="/admin/matches"
          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-center text-sm font-medium text-[var(--accent)]"
        >
          View Matches
        </Link>
        <Link
          href="/admin/matches/create"
          className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-center text-sm font-medium text-white"
        >
          Create Match
        </Link>
      </nav>

      <form className="mt-5">
        <input
          name="q"
          defaultValue={params.q || ""}
          placeholder="Search name, email, city…"
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base outline-none focus:border-[var(--accent)]"
        />
        {params.status ? <input type="hidden" name="status" value={params.status} /> : null}
      </form>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const active = (params.status || "") === tab.key;
          const href = tab.key
            ? `/admin?status=${tab.key}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`
            : `/admin${params.q ? `?q=${encodeURIComponent(params.q)}` : ""}`;
          return (
            <Link
              key={tab.key || "all"}
              href={href}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
                active
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--line)] bg-white text-[var(--ink)]"
              }`}
            >
              {tab.label} {tab.count}
            </Link>
          );
        })}
      </div>

      <section className="mt-5 space-y-3">
        {filtered.map((p) => (
          <Link
            key={p.id}
            href={`/admin/people/${p.id}`}
            className="flex items-center gap-3 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-3 active:scale-[0.99]"
          >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[var(--accent-soft)]">
              {p.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photoUrl} alt="" className="h-full w-full object-cover" />
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
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusTone(p.status)}`}>
                  {statusLabel(p.status)}
                </span>
              </div>
              <p className="mt-0.5 truncate text-sm text-[var(--muted)]">
                {[p.profile?.location, p.profile?.religiosity, p.profile?.work]
                  .filter(Boolean)
                  .join(" · ") || p.phone}
              </p>
            </div>
          </Link>
        ))}

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--line)] bg-white/60 px-5 py-10 text-center text-[var(--muted)]">
            No people yet. Start outreach below, or use the simulator.
          </div>
        ) : null}
      </section>

      <section className="mt-8 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <h2 className="text-base font-semibold">Start WhatsApp outreach</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Send the opening TOIMOI message on WhatsApp.
        </p>
        <StartOutreachForm />
      </section>

      <div className="mt-6 text-center">
        <Link href="/sim" className="text-sm text-[var(--accent)]">
          Open WhatsApp simulator
        </Link>
      </div>
    </main>
  );
}
