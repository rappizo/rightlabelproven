import { AlertTriangle, Clock3, FileStack, ShieldCheck } from "lucide-react";

import { submitApplicationAction } from "@/app/actions";
import { SiteShell } from "@/components/site-shell";

type ApplicationPageProps = {
  searchParams: Promise<{ submitted?: string; error?: string }>;
};

const phases = [
  { title: "Phase 1: Compliance Review", duration: "2-3 business days" },
  { title: "Phase 2: Lab Analysis (HPLC / Mass Spec)", duration: "10-14 business days" },
  { title: "Phase 3: Certification Issuance", duration: "48 hours" },
];

export default async function ApplicationPage({ searchParams }: ApplicationPageProps) {
  const params = await searchParams;

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          <div className="space-y-8">
            <div className="rounded-[2.5rem] bg-gradient-to-br from-pine to-ocean px-8 py-14 text-white md:px-12">
              <span className="section-eyebrow border-white/15 bg-white/10 text-emerald-200">
                Manufacturer protocols
              </span>
              <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold md:text-6xl">
                Certification application
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
                The Right Label Proven seal is earned, not bought. This intake is designed to help
                your team start compliance review while keeping the scientific bar high.
              </p>
            </div>

            <div className="rounded-[2rem] border border-amber-300/50 bg-amber-50 p-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="mt-1 h-6 w-6 text-amber-600" />
                <div>
                  <h2 className="font-display text-2xl font-bold text-amber-900">
                    Mandatory GMP requirement
                  </h2>
                  <p className="mt-3 leading-8 text-amber-900/80">
                    We do not work with manufacturers who cannot provide current cGMP certification.
                    If your facility is not FDA-registered or cannot support a defensible dossier,
                    the application will not move forward.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-line bg-white p-8 shadow-panel">
              <div className="flex items-center gap-3">
                <FileStack className="h-6 w-6 text-leaf" />
                <h2 className="font-display text-3xl font-bold text-pine">Submission protocol</h2>
              </div>
              <div className="mt-8 space-y-8">
                {[
                  {
                    number: "01",
                    title: "Prepare your dossier",
                    copy: "Include formulation data, raw material COAs, the facility GMP certificate, and any notes required for context.",
                  },
                  {
                    number: "02",
                    title: "Submit your compliance intake",
                    copy: "Use the form to start the record. If your dossier is too large for email, include a secure link in the dossier field.",
                  },
                  {
                    number: "03",
                    title: "Expect blind retail acquisition",
                    copy: "We do not rely only on factory-provided samples. Consumer-facing retail inventory is what the market actually sees, so that is what matters.",
                  },
                ].map((step) => (
                  <div key={step.number} className="flex gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-leaf/10 font-display text-2xl font-bold text-leaf">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-bold text-pine">{step.title}</h3>
                      <p className="mt-2 leading-8 text-ink/70">{step.copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[2rem] border border-line bg-white p-8 shadow-panel">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-6 w-6 text-leaf" />
                  <h2 className="font-display text-2xl font-bold text-pine">Timeline & standards</h2>
                </div>
                <div className="mt-6 space-y-4">
                  {phases.map((phase) => (
                    <div key={phase.title} className="rounded-3xl bg-mist p-5">
                      <p className="font-semibold text-pine">{phase.title}</p>
                      <p className="mt-2 text-sm text-ink/65">{phase.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] border border-line bg-pine p-8 text-white shadow-panel">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-200" />
                  <h2 className="font-display text-2xl font-bold">If the test fails</h2>
                </div>
                <ul className="mt-6 space-y-4 text-sm leading-7 text-white/75">
                  <li>Results under 95% active ingredients can trigger immediate denial.</li>
                  <li>High heavy metals or contamination generate a forensic failure report.</li>
                  <li>Re-application is typically delayed for 60 days after remediation.</li>
                  <li>Lab pricing varies by formulation complexity and is quoted after review.</li>
                </ul>
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[2rem] border border-line bg-white p-8 shadow-panel">
              <h2 className="font-display text-3xl font-bold text-pine">Start your intake</h2>
              <p className="mt-3 text-sm leading-7 text-ink/70">
                This goes directly into the new admin backend so your team can review and triage
                submissions without WordPress plugins or inbox chaos.
              </p>
              {params.submitted === "1" ? (
                <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  Your application request was received. The admin dashboard now has a structured
                  submission record for follow-up.
                </div>
              ) : null}
              {params.error === "1" ? (
                <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                  Please review the form and try again.
                </div>
              ) : null}
              <form action={submitApplicationAction} className="mt-6 space-y-4">
                <input
                  name="companyName"
                  required
                  placeholder="Company name"
                  className="w-full rounded-2xl border border-line px-4 py-3 outline-none transition focus:border-leaf"
                />
                <input
                  name="contactName"
                  required
                  placeholder="Primary contact"
                  className="w-full rounded-2xl border border-line px-4 py-3 outline-none transition focus:border-leaf"
                />
                <input
                  name="email"
                  required
                  type="email"
                  placeholder="Work email"
                  className="w-full rounded-2xl border border-line px-4 py-3 outline-none transition focus:border-leaf"
                />
                <input
                  name="phone"
                  placeholder="Phone"
                  className="w-full rounded-2xl border border-line px-4 py-3 outline-none transition focus:border-leaf"
                />
                <input
                  name="website"
                  type="url"
                  placeholder="Website"
                  className="w-full rounded-2xl border border-line px-4 py-3 outline-none transition focus:border-leaf"
                />
                <input
                  name="facilityLocation"
                  required
                  placeholder="Facility location"
                  className="w-full rounded-2xl border border-line px-4 py-3 outline-none transition focus:border-leaf"
                />
                <div className="rounded-2xl border border-line px-4 py-3">
                  <label className="flex items-center gap-3 text-sm font-semibold text-pine">
                    <input type="checkbox" name="gmpCertified" className="h-4 w-4" />
                    cGMP certification available
                  </label>
                </div>
                <input
                  name="gmpCertificateBody"
                  placeholder="Certifying body"
                  className="w-full rounded-2xl border border-line px-4 py-3 outline-none transition focus:border-leaf"
                />
                <input
                  name="productName"
                  required
                  placeholder="Primary product"
                  className="w-full rounded-2xl border border-line px-4 py-3 outline-none transition focus:border-leaf"
                />
                <input
                  name="productCategory"
                  required
                  placeholder="Product category"
                  className="w-full rounded-2xl border border-line px-4 py-3 outline-none transition focus:border-leaf"
                />
                <input
                  name="dossierUrl"
                  type="url"
                  placeholder="Secure dossier link"
                  className="w-full rounded-2xl border border-line px-4 py-3 outline-none transition focus:border-leaf"
                />
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Anything the compliance team should know?"
                  className="w-full rounded-[1.5rem] border border-line px-4 py-3 outline-none transition focus:border-leaf"
                />
                <button
                  type="submit"
                  className="w-full rounded-full bg-leaf px-5 py-3 text-sm font-bold text-white transition hover:bg-pine"
                >
                  Submit application request
                </button>
              </form>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
