import Link from "next/link";

import {
  deleteProductAction,
  saveProductAction,
  verifyProductConfirmationAction,
} from "@/app/actions";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getAllProducts } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { deserializeVerificationAnalytes } from "@/lib/verification-dossier";

type AdminProductsPageProps = {
  searchParams: Promise<{ verified?: string; error?: string; message?: string }>;
};

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const admin = await requireAdmin();
  const products = await getAllProducts();
  const params = await searchParams;
  const errorCopy =
    params.error === "missing-csv"
      ? "Upload a Supplement Facts CSV before running Verify Confirmation."
      : params.error === "invalid-csv"
        ? params.message || "The uploaded CSV could not be parsed."
        : null;

  return (
    <AdminShell
      adminName={admin.name}
      title="Products"
      description="Manage the public verification registry, generate archived verification confirmations, and control which records appear as featured on the homepage."
    >
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h2 className="font-display text-2xl font-bold">Create a new product record</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">
          Upload a Supplement Facts CSV with `ingredient`, `serving size`, and `amount/serving`
          columns, then run Verify Confirmation to generate a downloadable PDF dossier and a public
          verified search result.
        </p>

        {params.verified === "1" ? (
          <div className="mt-5 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Verification confirmation generated successfully. The product dossier is now available
            in the admin panel and public verification search.
          </div>
        ) : null}

        {errorCopy ? (
          <div className="mt-5 rounded-3xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {errorCopy}
          </div>
        ) : null}

        <form action={saveProductAction} encType="multipart/form-data" className="mt-6 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="redirectTo" value="/admin/products" />
          <input
            name="brandName"
            required
            placeholder="Brand name"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
          <input
            name="productName"
            required
            placeholder="Product name"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
          <input
            name="category"
            required
            placeholder="Category"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
          <input
            name="verificationCode"
            required
            placeholder="Verification code"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
          <input
            name="upc"
            placeholder="UPC"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
          <input
            name="lotNumber"
            placeholder="Lot number"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
          <input
            name="certificateStatus"
            defaultValue="ACTIVE"
            placeholder="Certificate status"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
          <input
            name="status"
            defaultValue="VERIFIED"
            placeholder="Verification status"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
          <input
            name="purityScore"
            type="number"
            step="0.1"
            placeholder="Purity score"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
          <input
            name="badgeLabel"
            placeholder="Badge label"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
          />
          <input
            name="activeIngredients"
            placeholder="Active ingredients summary"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2"
          />
          <input
            name="contaminants"
            placeholder="Contaminants summary"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2"
          />
          <textarea
            name="notes"
            rows={4}
            placeholder="Internal/public note"
            className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2"
          />
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/10 p-4 md:col-span-2">
            <label className="block text-sm font-semibold text-white/90">
              Supplement Facts CSV
              <input
                name="supplementFactsCsv"
                type="file"
                accept=".csv,text/csv"
                className="mt-3 block w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:font-semibold file:text-white"
              />
            </label>
            <p className="mt-3 text-xs leading-6 text-white/60">
              Required columns: `ingredient`, `serving size`, `amount/serving`.
            </p>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold md:col-span-2">
            <input type="checkbox" name="hero" />
            Feature on homepage
          </label>
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white"
            >
              Save product
            </button>
            <button
              type="submit"
              formAction={verifyProductConfirmationAction}
              className="rounded-full border border-emerald-300/30 bg-emerald-500/15 px-5 py-3 text-sm font-bold text-emerald-100"
            >
              Verify Confirmation
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-6">
        {products.map((product) => {
          const analytes = deserializeVerificationAnalytes(product.analyteResultsJson);

          return (
            <div key={product.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold">{product.brandName}</h2>
                  <p className="text-sm text-white/60">
                    {product.productName} / {product.verificationCode}
                  </p>
                </div>
                <form action={deleteProductAction}>
                  <input type="hidden" name="id" value={product.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-rose-400/30 px-4 py-2 text-sm font-semibold text-rose-200"
                  >
                    Delete
                  </button>
                </form>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
                    Verification dossier
                  </p>
                  <div className="mt-3 grid gap-3 text-sm text-white/75 sm:grid-cols-2">
                    <div>
                      <p className="text-white/45">Status</p>
                      <p className="mt-1 font-semibold text-white">{product.status}</p>
                    </div>
                    <div>
                      <p className="text-white/45">Analytes</p>
                      <p className="mt-1 font-semibold text-white">{analytes.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-white/45">Serving size</p>
                      <p className="mt-1 font-semibold text-white">
                        {product.servingSize || "Not archived"}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/45">Last verification</p>
                      <p className="mt-1 font-semibold text-white">
                        {product.verifiedAt ? formatDate(product.verifiedAt) : "Not generated"}
                      </p>
                    </div>
                  </div>
                  {product.verificationPdfBase64 ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/verified-dossiers/${product.id}`}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-pine"
                      >
                        Download archived PDF
                      </Link>
                      {product.supplementFactsFileName ? (
                        <p className="self-center text-xs text-white/55">
                          Source CSV: {product.supplementFactsFileName}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-white/60">
                      No verification dossier has been generated for this product yet.
                    </p>
                  )}
                </div>

                {analytes.length > 0 ? (
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
                      Assayed analytes
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      {analytes.slice(0, 4).map((analyte) => (
                        <div
                          key={`${product.id}-${analyte.ingredient}`}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/10 px-3 py-2"
                        >
                          <div>
                            <p className="font-semibold text-white">{analyte.ingredient}</p>
                            <p className="text-xs text-white/50">{analyte.labelClaimRaw}</p>
                          </div>
                          <p className="text-xs font-bold text-emerald-200">
                            {analyte.percentOfLabelClaim.toFixed(2)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <form action={saveProductAction} encType="multipart/form-data" className="mt-6 grid gap-4 md:grid-cols-2">
                <input type="hidden" name="id" value={product.id} />
                <input type="hidden" name="redirectTo" value="/admin/products" />
                <input
                  name="brandName"
                  defaultValue={product.brandName}
                  required
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
                />
                <input
                  name="productName"
                  defaultValue={product.productName}
                  required
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
                />
                <input
                  name="category"
                  defaultValue={product.category}
                  required
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
                />
                <input
                  name="verificationCode"
                  defaultValue={product.verificationCode}
                  required
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
                />
                <input
                  name="upc"
                  defaultValue={product.upc || ""}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
                />
                <input
                  name="lotNumber"
                  defaultValue={product.lotNumber || ""}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
                />
                <input
                  name="certificateStatus"
                  defaultValue={product.certificateStatus}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
                />
                <input
                  name="status"
                  defaultValue={product.status}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
                />
                <input
                  name="purityScore"
                  type="number"
                  step="0.1"
                  defaultValue={product.purityScore || ""}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
                />
                <input
                  name="badgeLabel"
                  defaultValue={product.badgeLabel || ""}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
                />
                <input
                  name="activeIngredients"
                  defaultValue={product.activeIngredients || ""}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2"
                />
                <input
                  name="contaminants"
                  defaultValue={product.contaminants || ""}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2"
                />
                <textarea
                  name="notes"
                  rows={4}
                  defaultValue={product.notes || ""}
                  className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2"
                />
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/10 p-4 md:col-span-2">
                  <label className="block text-sm font-semibold text-white/90">
                    Replace / upload Supplement Facts CSV
                    <input
                      name="supplementFactsCsv"
                      type="file"
                      accept=".csv,text/csv"
                      className="mt-3 block w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:font-semibold file:text-white"
                    />
                  </label>
                  <p className="mt-3 text-xs leading-6 text-white/60">
                    {product.supplementFactsFileName
                      ? `Current archived CSV: ${product.supplementFactsFileName}`
                      : "Required columns: ingredient, serving size, amount/serving."}
                  </p>
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold md:col-span-2">
                  <input type="checkbox" name="hero" defaultChecked={product.hero} />
                  Feature on homepage
                </label>
                <div className="flex flex-wrap gap-3 md:col-span-2">
                  <button
                    type="submit"
                    className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white"
                  >
                    Update product
                  </button>
                  <button
                    type="submit"
                    formAction={verifyProductConfirmationAction}
                    className="rounded-full border border-emerald-300/30 bg-emerald-500/15 px-5 py-3 text-sm font-bold text-emerald-100"
                  >
                    Verify Confirmation
                  </button>
                </div>
              </form>
            </div>
          );
        })}
      </section>
    </AdminShell>
  );
}
