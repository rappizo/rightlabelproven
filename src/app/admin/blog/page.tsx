import { deleteBlogPostAction, saveBlogPostAction } from "@/app/actions";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getBlogPosts } from "@/lib/data";

function toDateTimeLocal(value: Date | string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export default async function AdminBlogPage() {
  const admin = await requireAdmin();
  const posts = await getBlogPosts();

  return (
    <AdminShell
      adminName={admin.name}
      title="Blog"
      description="Publish and maintain editorial content directly inside the application."
    >
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h2 className="font-display text-2xl font-bold">Create a new post</h2>
        <form action={saveBlogPostAction} className="mt-6 grid gap-4">
          <input name="title" required placeholder="Title" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <input name="slug" placeholder="Slug (optional)" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <div className="grid gap-4 md:grid-cols-3">
            <input name="category" required placeholder="Category" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
            <input name="authorName" required placeholder="Author" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
            <input name="publishedAt" type="datetime-local" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          </div>
          <input name="coverImage" placeholder="Cover image URL" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <textarea name="excerpt" required rows={3} placeholder="Excerpt" className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <textarea name="contentHtml" required rows={12} placeholder="HTML content" className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold">
            <input type="checkbox" name="featured" />
            Feature on the homepage
          </label>
          <button type="submit" className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white md:w-fit">
            Save post
          </button>
        </form>
      </section>

      <section className="grid gap-6">
        {posts.map((post) => (
          <div key={post.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">{post.title}</h2>
                <p className="text-sm text-white/60">
                  {post.slug} / {post.category}
                </p>
              </div>
              <form action={deleteBlogPostAction}>
                <input type="hidden" name="id" value={post.id} />
                <button type="submit" className="rounded-full border border-rose-400/30 px-4 py-2 text-sm font-semibold text-rose-200">
                  Delete
                </button>
              </form>
            </div>
            <form action={saveBlogPostAction} className="mt-6 grid gap-4">
              <input type="hidden" name="id" value={post.id} />
              <input name="title" defaultValue={post.title} required className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
              <input name="slug" defaultValue={post.slug} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
              <div className="grid gap-4 md:grid-cols-3">
                <input name="category" defaultValue={post.category} required className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
                <input name="authorName" defaultValue={post.authorName} required className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
                <input
                  name="publishedAt"
                  type="datetime-local"
                  defaultValue={toDateTimeLocal(post.publishedAt)}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
                />
              </div>
              <input name="coverImage" defaultValue={post.coverImage || ""} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
              <textarea name="excerpt" defaultValue={post.excerpt} required rows={3} className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 outline-none" />
              <textarea name="contentHtml" defaultValue={post.contentHtml} required rows={12} className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 outline-none" />
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold">
                <input type="checkbox" name="featured" defaultChecked={post.featured} />
                Feature on the homepage
              </label>
              <button type="submit" className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white md:w-fit">
                Update post
              </button>
            </form>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}
