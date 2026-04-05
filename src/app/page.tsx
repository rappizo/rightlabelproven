import Link from "next/link";
import {
  ArrowRight,
  Beaker,
  BookOpenText,
  CheckCircle2,
  FileCheck2,
  Microscope,
  ShieldCheck,
} from "lucide-react";

import { SiteShell } from "@/components/site-shell";
import { getFeaturedBlogPosts, getFeaturedProducts, getSiteSettings } from "@/lib/data";
import { advisors, partnerLogos, processSteps } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, featuredProducts, featuredPosts] = await Promise.all([
    getSiteSettings(),
    getFeaturedProducts(),
    getFeaturedBlogPosts(),
  ]);

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-hero-grid">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div className="space-y-8 text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              {settings.heroTagline}
            </span>
            <div className="space-y-6">
              <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                {settings.heroHeadline}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/78 md:text-xl">
                {settings.heroSubheadline}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/verify"
                className="rounded-full bg-white px-6 py-3 text-sm font-bold text-pine transition hover:bg-emerald-100"
              >
                Verify a Product
              </Link>
              <Link
                href="/application"
                className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/15"
              >
                Apply for RLP Program
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: "Purity threshold", value: "99.98%" },
                { label: "Label sync", value: "100%" },
                { label: "Lab review", value: "ISO/IEC 17025" },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-xl"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">{metric.label}</p>
                  <p className="mt-2 font-display text-2xl font-bold">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <div className="glass-panel w-full rounded-[2rem] border border-white/30 p-6 shadow-glow md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf">
                    Live verification snapshot
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-bold text-pine">
                    Batch #{featuredProducts[0]?.lotNumber || "774-O"} analysis
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-ink/65">
                    Verified by independent scientific review with retail pull sampling, heavy metal
                    screening, and molecular analysis.
                  </p>
                </div>
                <div className="rounded-full bg-emerald-100 px-4 py-3 text-center">
                  <p className="font-display text-2xl font-bold text-leaf">A+</p>
                </div>
              </div>
              <div className="mt-8 space-y-5">
                {[
                  { label: "Purity threshold", width: "w-[99%]", value: "99.98% passed" },
                  { label: "Bioavailability factor", width: "w-[92%]", value: "Optimal" },
                  { label: "Heavy metal screen", width: "w-full", value: "Clear" },
                ].map((bar) => (
                  <div key={bar.label} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                      <span>{bar.label}</span>
                      <span className="text-leaf">{bar.value}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200">
                      <div className={`h-full rounded-full bg-gradient-to-r from-leaf to-gold ${bar.width}`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Heavy metals", value: "0.0 ppb" },
                  { label: "Label sync", value: "100%" },
                  { label: "Certificate", value: "ACTIVE" },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-line bg-white/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-ink/55">{item.label}</p>
                    <p className="mt-2 font-display text-2xl font-bold text-pine">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white/80">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-ink/50">
            Certified laboratory standards
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {partnerLogos.map((logo) => (
              <div
                key={logo}
                className="rounded-3xl border border-line bg-mist px-5 py-6 text-center font-display text-xl font-bold text-pine"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 max-w-3xl space-y-4">
          <span className="section-eyebrow">Trust UX</span>
          <h2 className="font-display text-4xl font-bold text-pine md:text-5xl">
            Science-backed verification your customers can actually understand
          </h2>
          <p className="text-lg leading-8 text-ink/70">
            The front end is clear and premium. The back end is data-rich and auditable. That
            combination is what turns a certification mark into a trust system.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] border border-line bg-white p-8 shadow-panel md:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-4">
                <span className="section-eyebrow">Molecular accuracy</span>
                <h3 className="font-display text-3xl font-bold text-pine">
                  Real-time spectral analysis
                </h3>
                <p className="max-w-2xl leading-8 text-ink/70">
                  Every certified brand undergoes continuing batch testing. The verification
                  experience is built to connect shoppers directly to the evidence behind the mark.
                </p>
                <Link
                  href="/verify"
                  className="inline-flex items-center gap-2 font-semibold text-leaf transition hover:text-pine"
                >
                  Explore verification lookup
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <Microscope className="hidden h-16 w-16 text-leaf/35 md:block" />
            </div>
          </div>
          <div className="rounded-[2rem] bg-pine p-8 text-white">
            <Beaker className="h-10 w-10 text-emerald-200" />
            <h3 className="mt-6 font-display text-2xl font-bold">Manual scientific rigor</h3>
            <p className="mt-4 leading-8 text-white/70">
              Triple-blind review, blind retail acquisition, and accredited lab methods replace the
              shallow “trust us” style common across the category.
            </p>
          </div>
          <div className="rounded-[2rem] border border-line bg-slate-50 p-8">
            <CheckCircle2 className="h-10 w-10 text-leaf" />
            <h3 className="mt-6 font-display text-2xl font-bold text-pine">Official verification</h3>
            <p className="mt-4 leading-8 text-ink/70">
              The RLP Verified seal is only valuable when it remains exclusive, traceable, and easy
              to confirm against a public record.
            </p>
          </div>
          <div className="rounded-[2rem] bg-gradient-to-br from-leaf to-pine p-8 text-white md:col-span-2">
            <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h3 className="font-display text-3xl font-bold">Verification database</h3>
                <p className="mt-4 max-w-2xl leading-8 text-white/75">
                  Search by brand name, product name, UPC, or verification code to instantly see
                  whether a product is part of the active registry.
                </p>
                <Link
                  href="/verify"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-pine transition hover:bg-emerald-50"
                >
                  Open product lookup
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                  Program launch
                </p>
                <p className="mt-3 font-display text-5xl font-bold">Hundreds</p>
                <p className="mt-2 text-white/70">of verified batch profiles and growing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/70 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl space-y-4">
              <span className="section-eyebrow">Certification protocol</span>
              <h2 className="font-display text-4xl font-bold text-pine">Our four-step review path</h2>
              <p className="leading-8 text-ink/70">
                We rebuilt the front end around the same rigor the backend is designed to manage.
                Manufacturers, consumers, and operators all see the same source of truth.
              </p>
            </div>
            <Link href="/application" className="text-sm font-semibold text-leaf">
              Start manufacturer intake
            </Link>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {processSteps.map((step) => (
              <div key={step.number} className="rounded-[2rem] border border-line bg-white p-6 shadow-panel">
                <p className="font-display text-5xl font-bold text-leaf/25">{step.number}</p>
                <h3 className="mt-4 font-display text-2xl font-bold text-pine">{step.title}</h3>
                <p className="mt-4 leading-8 text-ink/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 max-w-3xl space-y-4">
          <span className="section-eyebrow">Transparency Vanguard</span>
          <h2 className="font-display text-4xl font-bold text-pine">Verified brands in the active registry</h2>
          <p className="leading-8 text-ink/70">
            The public experience should feel premium, but the confidence comes from the backend
            record behind each listing.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <article key={product.id} className="rounded-[2rem] border border-line bg-white p-6 shadow-panel">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-emerald-100 to-white p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf">{product.category}</p>
                <h3 className="mt-4 font-display text-2xl font-bold text-pine">{product.brandName}</h3>
                <p className="mt-2 text-sm text-ink/70">{product.productName}</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-leaf">
                  {product.badgeLabel || product.status}
                </span>
                <span className="text-sm font-semibold text-ink/60">{product.verificationCode}</span>
              </div>
              <p className="mt-5 text-sm leading-7 text-ink/70">
                Purity score {product.purityScore?.toFixed(1)}%. Certificate {product.certificateStatus}.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-pine py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <span className="section-eyebrow border-white/15 bg-white/10 text-emerald-200">
              For consumers
            </span>
            <h2 className="mt-6 font-display text-4xl font-bold">Know what you consume</h2>
            <p className="mt-4 leading-8 text-white/75">
              Don’t guess with your health. Search the registry to verify whether a product has been
              reviewed against label claims and contamination thresholds.
            </p>
            <Link
              href="/verify"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-pine"
            >
              Search the registry
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8">
            <span className="section-eyebrow border-white/15 bg-white/10 text-emerald-200">
              For manufacturers
            </span>
            <h2 className="mt-6 font-display text-4xl font-bold">Prove your quality to the market</h2>
            <p className="mt-4 leading-8 text-white/75">
              Honest brands deserve a front-end story backed by real lab outcomes. RLP helps turn
              compliance into a visible advantage.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/10 p-5">
                <p className="font-display text-4xl font-bold">82%</p>
                <p className="mt-2 text-sm text-white/70">Consumers prefer tested products</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/10 p-5">
                <p className="font-display text-4xl font-bold">100%</p>
                <p className="mt-2 text-sm text-white/70">Transparent results in the registry</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 max-w-3xl space-y-4">
          <span className="section-eyebrow">Scientific advisory board</span>
          <h2 className="font-display text-4xl font-bold text-pine">Standards led by real specialists</h2>
          <p className="leading-8 text-ink/70">
            The new build preserves the scientific story already on the site while giving you a more
            editorial, premium presentation.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {advisors.map((advisor) => (
            <article key={advisor.name} className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-panel">
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                {/* Using a native img avoids Vercel image transformation usage. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={advisor.image}
                  alt={advisor.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf">
                  {advisor.credential}
                </p>
                <h3 className="mt-3 font-display text-2xl font-bold text-pine">{advisor.name}</h3>
                <p className="mt-2 text-sm leading-7 text-ink/70">{advisor.title}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white/70 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 max-w-3xl space-y-4">
            <span className="section-eyebrow">Latest insights</span>
            <h2 className="font-display text-4xl font-bold text-pine">Editorial publishing, now native to your stack</h2>
            <p className="leading-8 text-ink/70">
              Blog content is now part of the same application, so operations, publishing, and public
              trust all live in one codebase.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredPosts.map((post) => (
              <article key={post.id} className="rounded-[2rem] border border-line bg-white p-6 shadow-panel">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-leaf">
                  <BookOpenText className="h-4 w-4" />
                  {post.category}
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold text-pine">{post.title}</h3>
                <p className="mt-4 leading-8 text-ink/70">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-6 inline-flex items-center gap-2 font-semibold text-leaf transition hover:text-pine"
                >
                  Read article
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-pine via-ocean to-leaf px-8 py-14 text-center text-white shadow-glow md:px-14">
          <FileCheck2 className="mx-auto h-12 w-12 text-emerald-200" />
          <h2 className="mt-6 font-display text-4xl font-bold md:text-5xl">
            Ready to replace WordPress with a real product stack?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/78">
            This Next.js rebuild gives you a modern front end, a searchable verification system,
            structured lead intake, editorial publishing, and an internal admin workspace in one
            place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/application"
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-pine transition hover:bg-emerald-50"
            >
              Start certification intake
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/15"
            >
              Talk to compliance support
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
