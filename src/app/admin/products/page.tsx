import { deleteProductAction, saveProductAction } from "@/app/actions";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getAllProducts } from "@/lib/data";

export default async function AdminProductsPage() {
  const admin = await requireAdmin();
  const products = await getAllProducts();

  return (
    <AdminShell
      adminName={admin.name}
      title="Products"
      description="Manage the public verification registry and control which product records appear as featured on the homepage."
    >
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h2 className="font-display text-2xl font-bold">Create a new product record</h2>
        <form action={saveProductAction} className="mt-6 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="redirectTo" value="/admin/products" />
          <input name="brandName" required placeholder="Brand name" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <input name="productName" required placeholder="Product name" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <input name="category" required placeholder="Category" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <input name="verificationCode" required placeholder="Verification code" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <input name="upc" placeholder="UPC" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <input name="lotNumber" placeholder="Lot number" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <input name="certificateStatus" defaultValue="ACTIVE" placeholder="Certificate status" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <input name="status" defaultValue="VERIFIED" placeholder="Verification status" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <input name="purityScore" type="number" step="0.1" placeholder="Purity score" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <input name="badgeLabel" placeholder="Badge label" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <input name="activeIngredients" placeholder="Active ingredients summary" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2" />
          <input name="contaminants" placeholder="Contaminants summary" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2" />
          <textarea name="notes" rows={4} placeholder="Internal/public note" className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2" />
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold md:col-span-2">
            <input type="checkbox" name="hero" />
            Feature on homepage
          </label>
          <button type="submit" className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white md:w-fit">
            Save product
          </button>
        </form>
      </section>

      <section className="grid gap-6">
        {products.map((product) => (
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
                <button type="submit" className="rounded-full border border-rose-400/30 px-4 py-2 text-sm font-semibold text-rose-200">
                  Delete
                </button>
              </form>
            </div>
            <form action={saveProductAction} className="mt-6 grid gap-4 md:grid-cols-2">
              <input type="hidden" name="id" value={product.id} />
              <input type="hidden" name="redirectTo" value="/admin/products" />
              <input name="brandName" defaultValue={product.brandName} required className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
              <input name="productName" defaultValue={product.productName} required className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
              <input name="category" defaultValue={product.category} required className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
              <input name="verificationCode" defaultValue={product.verificationCode} required className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
              <input name="upc" defaultValue={product.upc || ""} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
              <input name="lotNumber" defaultValue={product.lotNumber || ""} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
              <input name="certificateStatus" defaultValue={product.certificateStatus} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
              <input name="status" defaultValue={product.status} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
              <input name="purityScore" type="number" step="0.1" defaultValue={product.purityScore || ""} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
              <input name="badgeLabel" defaultValue={product.badgeLabel || ""} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
              <input name="activeIngredients" defaultValue={product.activeIngredients || ""} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2" />
              <input name="contaminants" defaultValue={product.contaminants || ""} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2" />
              <textarea name="notes" rows={4} defaultValue={product.notes || ""} className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2" />
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold md:col-span-2">
                <input type="checkbox" name="hero" defaultChecked={product.hero} />
                Feature on homepage
              </label>
              <button type="submit" className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white md:w-fit">
                Update product
              </button>
            </form>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}
