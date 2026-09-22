"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const tabs = [
  { href: "/admin", label: "People" },
  { href: "/admin/consultations", label: "Times" },
  { href: "/admin/matches", label: "Matches" },
];

export function AdminChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <>
      {children}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-lg grid-cols-3">
          {tabs.map((tab) => {
            const active = tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-3 text-center text-sm font-medium ${
                  active ? "text-[var(--accent)]" : "text-[var(--muted)]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
