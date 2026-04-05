import { saveSiteSettingsAction } from "@/app/actions";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/data";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  const settings = await getSiteSettings();

  return (
    <AdminShell
      adminName={admin.name}
      title="Settings"
      description="Global content values shared across the public site."
    >
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h2 className="font-display text-2xl font-bold">Brand & contact settings</h2>
        <form action={saveSiteSettingsAction} className="mt-6 grid gap-4 md:grid-cols-2">
          <input name="organizationName" defaultValue={settings.organizationName} required className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <input name="heroTagline" defaultValue={settings.heroTagline} required className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <input name="supportEmail" defaultValue={settings.supportEmail} required className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <input name="supportPhone" defaultValue={settings.supportPhone} required className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none" />
          <input name="supportHours" defaultValue={settings.supportHours} required className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2" />
          <input name="addressLine1" defaultValue={settings.addressLine1} required className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2" />
          <input name="addressLine2" defaultValue={settings.addressLine2} required className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2" />
          <textarea name="heroHeadline" defaultValue={settings.heroHeadline} required rows={3} className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2" />
          <textarea name="heroSubheadline" defaultValue={settings.heroSubheadline} required rows={5} className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2" />
          <textarea name="footerStatement" defaultValue={settings.footerStatement} required rows={3} className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 outline-none md:col-span-2" />
          <button type="submit" className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white md:w-fit">
            Save settings
          </button>
        </form>
      </section>
    </AdminShell>
  );
}
