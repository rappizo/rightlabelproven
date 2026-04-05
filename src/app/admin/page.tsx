import Link from "next/link";

import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { databaseLabel, databaseMode, prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  const [productCount, postCount, contactCount, applicationCount, products, posts, contactSubmissions, applicationSubmissions] = await Promise.all([
    prisma.productVerification.count(),
    prisma.blogPost.count(),
    prisma.contactSubmission.count(),
    prisma.applicationSubmission.count(),
    prisma.productVerification.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.contactSubmission.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.applicationSubmission.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <AdminShell
      adminName={admin.name}
      title="Dashboard"
      description="A compact operations hub for product verification, content publishing, and lead intake."
    >
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">
              Active data source
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold">{databaseLabel}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
              {databaseMode === "supabase"
                ? "DATABASE_URL is configured, so the app is reading and writing through Prisma into Supabase."
                : "Supabase credentials are not configured yet, so the app is temporarily using data/store.json for local fallback."}
            </p>
          </div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200">
            {databaseMode === "supabase" ? "Database live" : "Fallback mode"}
          </span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Products", value: productCount.toString(), href: "/admin/products" },
          { label: "Posts", value: postCount.toString(), href: "/admin/blog" },
          { label: "Contacts", value: contactCount.toString(), href: "/admin/submissions" },
          { label: "Applications", value: applicationCount.toString(), href: "/admin/submissions" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">{stat.label}</p>
            <p className="mt-3 font-display text-4xl font-bold">{stat.value}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="font-display text-2xl font-bold">Latest products</h2>
          <div className="mt-5 space-y-4">
            {products.map((product) => (
              <div key={product.id} className="rounded-3xl border border-white/10 bg-black/10 p-4">
                <p className="font-semibold">{product.brandName}</p>
                <p className="text-sm text-white/60">{product.productName}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-300">
                  {product.verificationCode} / {product.status}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="font-display text-2xl font-bold">Latest blog posts</h2>
          <div className="mt-5 space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="rounded-3xl border border-white/10 bg-black/10 p-4">
                <p className="font-semibold">{post.title}</p>
                <p className="text-sm text-white/60">{formatDate(post.publishedAt)}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-300">{post.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="font-display text-2xl font-bold">Recent contact submissions</h2>
          <div className="mt-5 space-y-4">
            {contactSubmissions.map((submission) => (
              <div key={submission.id} className="rounded-3xl border border-white/10 bg-black/10 p-4">
                <p className="font-semibold">{submission.name}</p>
                <p className="text-sm text-white/60">{submission.reason}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-300">
                  {submission.status} / {formatDate(submission.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="font-display text-2xl font-bold">Recent applications</h2>
          <div className="mt-5 space-y-4">
            {applicationSubmissions.map((submission) => (
              <div key={submission.id} className="rounded-3xl border border-white/10 bg-black/10 p-4">
                <p className="font-semibold">{submission.companyName}</p>
                <p className="text-sm text-white/60">{submission.productName}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-300">
                  {submission.status} / {formatDate(submission.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
