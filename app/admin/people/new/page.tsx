import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AddPersonForm } from "@/app/admin/AddPersonForm";

export const dynamic = "force-dynamic";

export default async function AddPersonPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const [people, questions] = await Promise.all([
    prisma.person.findMany({
      select: { id: true, firstName: true, phone: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.adminQuestion.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, text: true },
    }),
  ]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 pb-24 pt-5">
      <Link href="/admin" className="text-sm text-[var(--accent)]">
        ← People
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--ink)]">Add person</h1>
      <div className="mt-8">
        <AddPersonForm
          people={people.map((person) => ({
            id: person.id,
            label: `${person.firstName || "Unnamed"} · ${person.phone}`,
          }))}
          questions={questions}
        />
      </div>
    </main>
  );
}
