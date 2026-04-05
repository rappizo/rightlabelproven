import { notFound } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { getBlogPostBySlug } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <SiteShell>
      <article className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-pine to-ocean px-8 py-14 text-white md:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
            {post.category} / {formatDate(post.publishedAt)}
          </p>
          <h1 className="mt-6 font-display text-5xl font-bold md:text-6xl">{post.title}</h1>
          <p className="mt-6 text-lg leading-8 text-white/78">{post.excerpt}</p>
          <p className="mt-4 text-sm font-semibold text-white/70">By {post.authorName}</p>
        </div>
        <div className="markdown-content mt-10 rounded-[2rem] border border-line bg-white p-8 shadow-panel md:p-10">
          <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        </div>
      </article>
    </SiteShell>
  );
}
