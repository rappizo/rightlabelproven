import Link from "next/link";
import { CheckCircle2, Download, Search, ShieldAlert, ShieldCheck } from "lucide-react";

import { runVerificationSearchAction } from "@/app/actions";
import { SiteShell } from "@/components/site-shell";
import { searchProductVerifications } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { deserializeVerificationAnalytes } from "@/lib/verification-dossier";

type VerifyPageProps = {
  searchParams: Promise<{ q?: string; error?: string }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const query = params.q?.trim();
  const results = query ? await searchProductVerifications(query) : [];

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-pine to-ocean px-8 py-14 text-white md:px-12">
          <span className="section-eyebrow border-white/15 bg-white/10 text-emerald-200">
            Public verification
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold md:text-6xl">Verify a product</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">
            Search by brand name, product name, UPC, lot number, verification code, or ingredient
            name to locate active Right Label Proven verification dossiers.
          </p>
          <form action={runVerificationSearchAction} className="mt-8 flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3">
              <Search className="h-5 w-5 text-white/65" />
              <input
                name="query"
                required
                defaultValue={query}
                placeholder="Enter brand, product, code, UPC, or analyte"
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

      <section className="mx-auto max-w-6xl px-6 pb-20">
        {!query ? (
          <div className="rounded-[2rem] border border-dashed border-line bg-white/70 p-10 text-center shadow-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf">Awaiting search</p>
            <h2 className="mt-4 font-display text-3xl font-bold text-pine">Lookup the active registry</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-8 text-ink/70">
              Search results are generated from the same verification dossiers archived by the admin
              team, including active PDF confirmations and analyte-level verification data.
            </p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 shadow-panel">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3 text-emerald-700">
                  <CheckCircle2 className="h-7 w-7" />
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em]">
                      Verification status: verified
                    </p>
                    <p className="mt-1 text-sm text-emerald-800/75">
                      {results.length} matching dossier{results.length === 1 ? "" : "s"} found for
                      &nbsp;&ldquo;{query}&rdquo;.
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-emerald-800/75">
                  Search matches brand, product, registry code, UPC, lot number, and analyte names.
                </p>
              </div>
            </div>

            {results.map((product) => {
              const analytes = deserializeVerificationAnalytes(product.analyteResultsJson);

              return (
                <article
                  key={product.id}
                  className="rounded-[2rem] border border-emerald-200 bg-white p-8 shadow-panel"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-emerald-700">
                        <CheckCircle2 className="h-7 w-7" />
                        <p className="text-sm font-bold uppercase tracking-[0.2em]">
                          Verified dossier
                        </p>
                      </div>
                      <h2 className="mt-5 font-display text-4xl font-bold text-pine">
                        {product.brandName} {product.productName}
                      </h2>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/70">
                        This product has an archived Right Label Proven verification confirmation and
                        analyte-level results reviewed against declared per-serving label claims.
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm shadow-sm">
                      <p className="font-semibold text-ink/55">Verification code</p>
                      <p className="mt-1 font-display text-xl font-bold text-pine">
                        {product.verificationCode}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {[
                      { label: "Certificate status", value: product.certificateStatus },
                      { label: "Lot reference", value: product.lotNumber || "On file" },
                      {
                        label: "Assay mean",
                        value: product.purityScore ? `${product.purityScore.toFixed(2)}%` : "On file",
                      },
                      { label: "Category", value: product.category },
                      {
                        label: "Serving size",
                        value: product.servingSize || analytes[0]?.servingSize || "On file",
                      },
                    ].map((item) => (
                      <div
                        key={`${product.id}-${item.label}`}
                        className="rounded-[1.5rem] border border-emerald-200 bg-white p-5"
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf">
                          {item.label}
                        </p>
                        <p className="mt-2 font-display text-2xl font-bold text-pine">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    {product.verificationPdfBase64 ? (
                      <Link
                        href={`/verified-dossiers/${product.id}`}
                        className="inline-flex items-center gap-2 rounded-full bg-pine px-5 py-3 text-sm font-bold text-white"
                      >
                        <Download className="h-4 w-4" />
                        Download verification PDF
                      </Link>
                    ) : null}
                    {product.verifiedAt ? (
                      <p className="text-sm text-ink/60">
                        Latest verification issued {formatDate(product.verifiedAt)}.
                      </p>
                    ) : null}
                  </div>

                  {analytes.length > 0 ? (
                    <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-line">
                      <div className="overflow-x-auto">
                        <div className="grid min-w-[820px] grid-cols-[1.2fr_1fr_1fr_0.8fr] gap-4 bg-slate-50 px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-ink/55">
                          <p>Analyte</p>
                          <p>Declared Quantity / Serving</p>
                          <p>Assayed Quantity / Serving</p>
                          <p>% of Label Claim</p>
                        </div>
                        <div className="divide-y divide-line bg-white">
                          {analytes.map((analyte) => (
                            <div
                              key={`${product.id}-${analyte.ingredient}`}
                              className="grid min-w-[820px] grid-cols-[1.2fr_1fr_1fr_0.8fr] gap-4 px-5 py-4 text-sm text-ink/75"
                            >
                              <p className="font-semibold text-pine">{analyte.ingredient}</p>
                              <p>{analyte.labelClaimRaw}</p>
                              <p>{analyte.assayedAmountRaw}</p>
                              <p className="font-semibold text-leaf">
                                {analyte.percentOfLabelClaim.toFixed(2)}%
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-6">
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-leaf">
                        Analytical summary
                      </p>
                      <ul className="mt-4 space-y-3 text-sm leading-7 text-ink/72">
                        <li>Active ingredients: {product.activeIngredients || "Within label tolerance"}</li>
                        <li>Contaminants: {product.contaminants || "None detected"}</li>
                        <li>Internal note: {product.notes || "No additional note on file"}</li>
                      </ul>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 shadow-panel">
            <div className="flex items-center gap-3 text-rose-700">
              <ShieldAlert className="h-7 w-7" />
              <p className="text-sm font-bold uppercase tracking-[0.2em]">Verification status: not found</p>
            </div>
            <h2 className="mt-5 font-display text-4xl font-bold text-pine">{query}</h2>
            <p className="mt-4 max-w-3xl leading-8 text-ink/72">
              We could not locate a matching Right Label Proven verification dossier for this search
              query. The product may be unverified, inactive, or outside the active public registry.
            </p>
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
            Verified means the product record is supported by an archived Right Label Proven dossier
            showing analyte-level assay values within the accepted 98.0%-102.0% label-claim interval
            on a per-serving basis. It does not replace medical advice or guarantee future lots
            without additional review.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
