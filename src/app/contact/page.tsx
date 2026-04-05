import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { submitContactAction } from "@/app/actions";
import { SiteShell } from "@/components/site-shell";
import { getSiteSettings } from "@/lib/data";

type ContactPageProps = {
  searchParams: Promise<{ submitted?: string; error?: string }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const settings = await getSiteSettings();

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-pine to-ocean px-8 py-14 text-white md:px-12">
          <span className="section-eyebrow border-white/15 bg-white/10 text-emerald-200">
            Contact us
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold md:text-6xl">Talk to the team</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">
            Whether someone is verifying a product, reporting counterfeit usage, or preparing for
            certification, the new stack gives your team one clear intake path.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          {[
            {
              title: "General support & inquiries",
              value: settings.supportEmail,
              copy: "For the fastest response regarding verification or product records.",
              icon: Mail,
            },
            {
              title: "Phone support",
              value: settings.supportPhone,
              copy: settings.supportHours,
              icon: Phone,
            },
            {
              title: "Laboratory & mailing address",
              value: settings.addressLine1,
              copy: settings.addressLine2,
              icon: MapPin,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-[2rem] border border-line bg-white p-8 shadow-panel">
                <Icon className="h-8 w-8 text-leaf" />
                <h2 className="mt-6 font-display text-2xl font-bold text-pine">{item.title}</h2>
                <p className="mt-4 font-semibold text-ink">{item.value}</p>
                <p className="mt-2 leading-8 text-ink/70">{item.copy}</p>
              </article>
            );
          })}

          <div className="rounded-[2rem] border border-line bg-pine p-8 text-white shadow-panel">
            <h2 className="font-display text-2xl font-bold">Need manufacturer intake instead?</h2>
            <p className="mt-4 leading-8 text-white/75">
              If the request is related to product certification and dossier review, send the brand
              through the structured application workflow instead of a generic message.
            </p>
            <Link
              href="/application"
              className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-pine"
            >
              Open application intake
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-line bg-white p-8 shadow-panel md:p-10">
          <h2 className="font-display text-3xl font-bold text-pine">Send a message</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70">
            Submissions here flow directly into the new admin dashboard so staff can triage, update,
            and resolve them from one place.
          </p>
          {params.submitted === "1" ? (
            <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Your message was sent successfully.
            </div>
          ) : null}
          {params.error === "1" ? (
            <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              Please review your entries and try again.
            </div>
          ) : null}
          <form action={submitContactAction} className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              name="name"
              required
              placeholder="Full name"
              className="rounded-2xl border border-line px-4 py-3 outline-none transition focus:border-leaf"
            />
            <input
              name="email"
              required
              type="email"
              placeholder="Email"
              className="rounded-2xl border border-line px-4 py-3 outline-none transition focus:border-leaf"
            />
            <input
              name="company"
              placeholder="Company"
              className="rounded-2xl border border-line px-4 py-3 outline-none transition focus:border-leaf md:col-span-2"
            />
            <select
              name="reason"
              required
              className="rounded-2xl border border-line px-4 py-3 outline-none transition focus:border-leaf md:col-span-2"
            >
              <option value="">Reason for contact</option>
              <option value="General Support">General Support</option>
              <option value="Verification Help">Verification Help</option>
              <option value="Counterfeit Report">Counterfeit Report</option>
              <option value="Manufacturer Inquiry">Manufacturer Inquiry</option>
            </select>
            <textarea
              name="message"
              required
              rows={6}
              placeholder="How can we help?"
              className="rounded-[1.5rem] border border-line px-4 py-3 outline-none transition focus:border-leaf md:col-span-2"
            />
            <button
              type="submit"
              className="rounded-full bg-leaf px-5 py-3 text-sm font-bold text-white transition hover:bg-pine md:col-span-2 md:w-fit"
            >
              Send message
            </button>
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
