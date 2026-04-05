import Link from "next/link";
import { CheckCircle2, Search, ShieldAlert, ShieldCheck } from "lucide-react";

import { runVerificationSearchAction } from "@/app/actions";
import { SiteShell } from "@/components/site-shell";
import { findProductVerification } from "@/lib/data";

type VerifyPageProps = {
  searchParams: Promise<{ q?: string; error?: string }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const query = params.q?.trim();
  const product = query ? await findProductVerification(query) : null;

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-pine to-ocean px-8 py-14 text-white md:px-12">
          <span className="section-eyebrow border-white/15 bg-white/10 text-emerald-200">
            Public verification
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold md:text-6xl">Verify a product</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">
            Search by brand name, product name, UPC, lot number, or verification code to check
            whether a product is in the active registry.
          </p>
          <form action={runVerificationSearchAction} className="mt-8 flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3">
              <Search className="h-5 w-5 text-white/65" />
              <input
                name="query"
                required
                defaultValue={query}
                placeholder="Enter product name, UPC, or verification code"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/55 outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-pine transition hover:bg-emerald-50"
            >
              Verify now
            </button>
          </form>
          {params.error === "1" ? (
            <p className="mt-4 text-sm text-amber-200">Enter a search term to continue.</p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        {!query ? (
          <div className="rounded-[2rem] border border-dashed border-line bg-white/70 p-10 text-center shadow-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf">Awaiting search</p>
            <h2 className="mt-4 font-display text-3xl font-bold text-pine">Lookup the active registry</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-8 text-ink/70">
              The old site used a fake client-side lookup. This rewrite uses a real backend product
              table, searchable from the admin console and the public site.
            </p>
          </div>
        ) : product ? (
          <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-8 shadow-panel">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-3 text-emerald-700">
                  <CheckCircle2 className="h-7 w-7" />
                  <p className="text-sm font-bold uppercase tracking-[0.2em]">Verification status: verified</p>
                </div>
                <h2 className="mt-5 font-display text-4xl font-bold text-pine">
                  {product.brandName} {product.productName}
                </h2>
                <p className="mt-3 text-sm leading-7 text-ink/70">
                  This product is in the active registry and has passed review against the current
                  label claim profile.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white px-5 py-4 text-sm shadow-sm">
                <p className="font-semibold text-ink/55">Verification code</p>
                <p className="mt-1 font-display text-xl font-bold text-pine">{product.verificationCode}</p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Certificate status", value: product.certificateStatus },
                { label: "Lot number", value: product.lotNumber || "On file" },
                { label: "Purity score", value: `${product.purityScore?.toFixed(1) || "0"}%` },
                { label: "Category", value: product.category },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-emerald-200 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf">{item.label}</p>
                  <p className="mt-2 font-display text-2xl font-bold text-pine">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-[1.5rem] border border-emerald-200 bg-white p-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-leaf">Analytical summary</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-ink/72">
                <li>Active ingredients: {product.activeIngredients || "Within label tolerance"}</li>
                <li>Contaminants: {product.contaminants || "None detected"}</li>
                <li>Internal note: {product.notes || "No additional note on file"}</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 shadow-panel">
            <div className="flex items-center gap-3 text-rose-700">
              <ShieldAlert className="h-7 w-7" />
              <p className="text-sm font-bold uppercase tracking-[0.2em]">Verification status: not found</p>
            </div>
            <h2 className="mt-5 font-display text-4xl font-bold text-pine">{query}</h2>
            <p className="mt-4 max-w-3xl leading-8 text-ink/72">
              We could not locate this product in the active registry. That means it is either
              unverified, inactive, or using the RLP mark without an active certificate.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { label: "Analysis", value: "UNVERIFIED" },
                { label: "Certificate", value: "INVALID / NULL" },
                { label: "Recommended action", value: "REPORT / REVIEW" },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-rose-200 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">{item.label}</p>
                  <p className="mt-2 font-display text-2xl font-bold text-pine">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="rounded-full bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
              >
                Report counterfeit use
              </Link>
              <Link
                href="/verify"
                className="rounded-full border border-rose-200 px-5 py-3 text-sm font-bold text-pine transition hover:bg-white"
              >
                Search another product
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 rounded-[2rem] border border-line bg-white p-8 shadow-panel">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-leaf" />
            <h3 className="font-display text-2xl font-bold text-pine">What verified means here</h3>
          </div>
          <p className="mt-4 leading-8 text-ink/70">
            Verification confirms that a product record exists in the internal registry and that the
            associated batch review reached active status. It does not replace medical advice or
            guarantee every future batch without additional review.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
