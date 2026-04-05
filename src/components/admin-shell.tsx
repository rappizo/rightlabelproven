import Link from "next/link";

import { signOutAction } from "@/app/actions";

const navigation = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({
  title,
  description,
  adminName,
  children,
}: {
  title: string;
  description: string;
  adminName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[250px_1fr]">
        <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="mb-8 space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              Right Label Proven
            </p>
            <p className="font-display text-2xl font-bold">Admin Console</p>
            <p className="text-sm text-white/60">Signed in as {adminName}</p>
          </div>
          <nav className="grid gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={signOutAction} className="mt-8">
            <button
              type="submit"
              className="w-full rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
            >
              Sign Out
            </button>
          </form>
        </aside>
        <div className="space-y-8">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/20 to-sky-500/10 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Internal Workspace
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
