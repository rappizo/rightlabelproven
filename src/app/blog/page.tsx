import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { getBlogPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-pine to-ocean px-8 py-14 text-white md:px-12">
          <span className="section-eyebrow border-white/15 bg-white/10 text-emerald-200">
            Insights & standards
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold md:text-6xl">Blog</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">
            Editorial publishing now lives inside the same application as verification, submissions,
            and operations.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-panel">
              {post.coverImage ? (
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {/* Using a native img avoids Vercel image transformation usage. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-leaf">
                  <span>{post.category}</span>
                  <span className="text-ink/35">/</span>
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                <h2 className="mt-4 font-display text-3xl font-bold text-pine">{post.title}</h2>
                <p className="mt-4 leading-8 text-ink/70">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-leaf transition hover:text-pine"
                >
                  Read article
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
