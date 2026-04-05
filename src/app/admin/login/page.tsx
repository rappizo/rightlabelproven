import { signInAction } from "@/app/actions";

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
          Right Label Proven
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold">Admin login</h1>
        <p className="mt-3 text-sm leading-7 text-white/65">
          Sign in to manage verification records, blog posts, site settings, and structured
          submissions.
        </p>
        {params.error === "1" ? (
          <div className="mt-5 rounded-3xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            Invalid account or password.
          </div>
        ) : null}
        <form action={signInAction} className="mt-6 space-y-4">
          <input
            name="account"
            type="text"
            required
            placeholder="Account"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/45 outline-none transition focus:border-emerald-400"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/45 outline-none transition focus:border-emerald-400"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-400"
          >
            Sign in
          </button>
        </form>
        <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
          Admin credentials are configured through environment variables.
        </div>
      </div>
    </main>
  );
}
