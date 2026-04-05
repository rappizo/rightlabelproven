import Link from "next/link";

import { deleteProductAction, saveProductAction } from "@/app/actions";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getAllProducts } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { deserializeVerificationAnalytes } from "@/lib/verification-dossier";

type AdminProductsPageProps = {
  searchParams: Promise<{
    create?: string;
    edit?: string;
    saved?: string;
    error?: string;
    message?: string;
  }>;
};

type ProductRecord = Awaited<ReturnType<typeof getAllProducts>>[number];

function formInputClassName() {
  return "rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none";
}

function ProductForm({
  mode,
  product,
  errorCopy,
}: {
  mode: "create" | "edit";
  product?: ProductRecord | null;
  errorCopy?: string | null;
}) {
  const isEdit = mode === "edit" && product;
  const errorRedirectTo = isEdit ? `/admin/products?edit=${product.id}` : "/admin/products?create=1";

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">
            {isEdit ? "Edit product dossier" : "Create product"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">
            Save Product is the only action here. If a Supplement Facts CSV is present, saving will
            automatically generate or refresh the archived PDF verification dossier.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
        >
          Back to product list
        </Link>
      </div>

      {errorCopy ? (
        <div className="mt-5 rounded-3xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorCopy}
        </div>
      ) : null}

      <form action={saveProductAction} encType="multipart/form-data" className="mt-6 grid gap-4 md:grid-cols-2">
        {isEdit ? <input type="hidden" name="id" value={product.id} /> : null}
        <input type="hidden" name="redirectTo" value="/admin/products" />
        <input type="hidden" name="errorRedirectTo" value={errorRedirectTo} />

        <input
          name="brandName"
          required
          defaultValue={product?.brandName || ""}
          placeholder="Brand name"
          className={formInputClassName()}
        />
        <input
          name="productName"
          required
          defaultValue={product?.productName || ""}
          placeholder="Product name"
          className={formInputClassName()}
        />
        <input
          name="category"
          required
          defaultValue={product?.category || ""}
          placeholder="Category"
          className={formInputClassName()}
        />
        <input
          name="verificationCode"
          required
          defaultValue={product?.verificationCode || ""}
          placeholder="Verification code"
          className={formInputClassName()}
        />
        <input
          name="upc"
          defaultValue={product?.upc || ""}
          placeholder="UPC"
          className={formInputClassName()}
        />
        <input
          name="lotNumber"
          defaultValue={product?.lotNumber || ""}
          placeholder="Lot number"
          className={formInputClassName()}
        />
        <input
          name="certificateStatus"
          defaultValue={product?.certificateStatus || "ACTIVE"}
          placeholder="Certificate status"
          className={formInputClassName()}
        />
        <input
          name="status"
          defaultValue={product?.status || "VERIFIED"}
          placeholder="Verification status"
          className={formInputClassName()}
        />
        <input
          name="purityScore"
          type="number"
          step="0.1"
          defaultValue={product?.purityScore || ""}
          placeholder="Purity score"
          className={formInputClassName()}
        />
        <input
          name="badgeLabel"
          defaultValue={product?.badgeLabel || ""}
          placeholder="Badge label"
          className={formInputClassName()}
        />
        <input
          name="activeIngredients"
          defaultValue={product?.activeIngredients || ""}
          placeholder="Active ingredients summary"
          className={`${formInputClassName()} md:col-span-2`}
        />
        <input
          name="contaminants"
          defaultValue={product?.contaminants || ""}
          placeholder="Contaminants summary"
          className={`${formInputClassName()} md:col-span-2`}
        />
        <textarea
          name="notes"
          rows={4}
          defaultValue={product?.notes || ""}
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
            {product?.supplementFactsFileName
              ? `Current archived CSV: ${product.supplementFactsFileName}`
              : "Required CSV columns: ingredient, serving size, amount/serving."}
          </p>
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold md:col-span-2">
          <input type="checkbox" name="hero" defaultChecked={product?.hero || false} />
          Feature on homepage
        </label>
        <button
          type="submit"
          className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white md:w-fit"
        >
          Save Product
        </button>
      </form>
    </section>
  );
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const admin = await requireAdmin();
  const products = await getAllProducts();
  const params = await searchParams;
  const selectedProduct = params.edit
    ? products.find((product) => product.id === params.edit) || null
    : null;
  const showCreate = params.create === "1" || (!selectedProduct && products.length === 0);
  const errorCopy =
    params.error === "invalid-csv"
      ? params.message || "The uploaded CSV could not be parsed."
      : null;

  return (
    <AdminShell
      adminName={admin.name}
      title="Products"
      description="Manage the product registry in a single list. Save Product updates the record and, when a Supplement Facts CSV is available, automatically refreshes the archived verification PDF."
    >
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Product registry</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">
              Existing products stay in a single list. Use Edit to revise the record, replace the
              CSV, and refresh the exported PDF dossier.
            </p>
          </div>
          <Link
            href="/admin/products?create=1"
            className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-400"
          >
            Create Product
          </Link>
        </div>

        {params.saved === "1" ? (
          <div className="mt-5 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Product saved successfully. If a valid Supplement Facts CSV was available, the PDF
            verification dossier was refreshed automatically.
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10">
          <div className="hidden grid-cols-[1.4fr_0.9fr_0.8fr_0.9fr_1.1fr] gap-4 bg-white/10 px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white/55 md:grid">
            <p>Product</p>
            <p>Category</p>
            <p>Status</p>
            <p>Verified</p>
            <p>Actions</p>
          </div>
          <div className="divide-y divide-white/10">
            {products.map((product) => {
              const analytes = deserializeVerificationAnalytes(product.analyteResultsJson);

              return (
                <div
                  key={product.id}
                  className="grid gap-4 bg-white/5 px-5 py-5 md:grid-cols-[1.4fr_0.9fr_0.8fr_0.9fr_1.1fr] md:items-center"
                >
                  <div>
                    <p className="font-display text-xl font-bold text-white">{product.brandName}</p>
                    <p className="mt-1 text-sm text-white/65">{product.productName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">
                      {product.verificationCode}
                    </p>
                  </div>

                  <div className="text-sm text-white/75">
                    <p>{product.category}</p>
                    <p className="mt-1 text-xs text-white/45">{product.lotNumber || "No lot reference"}</p>
                  </div>

                  <div className="text-sm text-white/75">
                    <p className="font-semibold text-emerald-200">{product.status}</p>
                    <p className="mt-1 text-xs text-white/45">
                      {analytes.length > 0 ? `${analytes.length} analytes archived` : "No analytes archived"}
                    </p>
                  </div>

                  <div className="text-sm text-white/75">
                    <p>{product.verifiedAt ? formatDate(product.verifiedAt) : "Not issued"}</p>
                    <p className="mt-1 text-xs text-white/45">
                      {product.verificationPdfBase64 ? "PDF ready" : "No PDF"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/products?edit=${product.id}`}
                      className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                    >
                      Edit
                    </Link>
                    {product.verificationPdfBase64 ? (
                      <Link
                        href={`/verified-dossiers/${product.id}`}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-pine"
                      >
                        Download PDF
                      </Link>
                    ) : null}
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
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {selectedProduct ? <ProductForm mode="edit" product={selectedProduct} errorCopy={errorCopy} /> : null}
      {!selectedProduct && showCreate ? <ProductForm mode="create" errorCopy={errorCopy} /> : null}
    </AdminShell>
  );
}
