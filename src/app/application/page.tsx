import { AlertTriangle, Clock3, FileStack, Search, ShieldCheck, Wallet } from "lucide-react";

import { runApplicationStatusLookupAction, submitApplicationAction } from "@/app/actions";
import {
  APPLICATION_STAGE_CONFIG,
  getApplicationWorkflowSummary,
} from "@/lib/application-workflow";
import { getApplicationSubmissionByApplicationId } from "@/lib/data";
import { SiteShell } from "@/components/site-shell";

export const dynamic = "force-dynamic";

type ApplicationPageProps = {
  searchParams: Promise<{
    submitted?: string;
    error?: string;
    applicationId?: string;
    lookup?: string;
    lookupError?: string;
  }>;
};

const submissionSteps = [
  {
    number: "01",
    title: "Prepare your dossier",
    copy: "Include formulation data, raw material COAs, the facility GMP certificate, and any supporting notes required for context.",
  },
  {
    number: "02",
    title: "Submit your compliance intake",
    copy: "Use the form to create the application record. A unique Application ID is generated immediately for client-side tracking.",
  },
  {
    number: "03",
    title: "Purchasing product on market",
    copy: "We procure consumer-facing retail inventory rather than relying only on factory-supplied samples. This blind market pull typically takes 3-5 business days after payment clears.",
  },
];

const stageToneClasses: Record<string, string> = {
  complete: "border-emerald-300/40 bg-emerald-500/10 text-emerald-100",
  current: "border-sky-300/40 bg-sky-500/10 text-white",
  upcoming: "border-white/10 bg-white/5 text-white/80",
  blocked: "border-white/10 bg-black/10 text-white/45",
};

export default async function ApplicationPage({ searchParams }: ApplicationPageProps) {
  const params = await searchParams;
  const lookupId = params.lookup?.trim().toUpperCase();
  const lookupRecord = lookupId
    ? await getApplicationSubmissionByApplicationId(lookupId)
    : null;
  const workflowSummary = lookupRecord ? getApplicationWorkflowSummary(lookupRecord) : null;

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_460px]">
          <div className="space-y-8">
            <div className="rounded-[2.5rem] bg-gradient-to-br from-pine to-ocean px-8 py-14 text-white md:px-12">
              <span className="section-eyebrow border-white/15 bg-white/10 text-emerald-200">
                Manufacturer protocols
              </span>
              <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold md:text-6xl">
                Certification application
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
                The Right Label Proven seal is earned, not bought. Each approved intake moves
                through review, invoicing, blind retail acquisition, analytical testing, and
                certification release under a trackable Application ID.
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
                {submissionSteps.map((step) => (
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
                  {APPLICATION_STAGE_CONFIG.map((phase, index) => (
                    <div key={phase.key} className="rounded-3xl bg-mist p-5">
                      <p className="font-semibold text-pine">
                        Phase {index + 1}: {phase.title}
                      </p>
                      <p className="mt-2 text-sm text-ink/65">{phase.durationLabel}</p>
                      <p className="mt-2 text-sm leading-7 text-ink/60">{phase.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] border border-line bg-pine p-8 text-white shadow-panel">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-200" />
                  <h2 className="font-display text-2xl font-bold">Workflow governance</h2>
                </div>
                <ul className="mt-6 space-y-4 text-sm leading-7 text-white/75">
                  <li>Applications only advance after internal approval in the admin review queue.</li>
                  <li>Payment issuing remains open until the client clears the quoted invoice.</li>
                  <li>Blind retail acquisition is tracked separately from laboratory analysis.</li>
                  <li>Clients can check progress at any time with the issued Application ID.</li>
                </ul>
              </div>
            </div>

            {workflowSummary ? (
              <section className="rounded-[2rem] border border-line bg-pine p-8 text-white shadow-panel">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-200">
                      Application tracker
                    </p>
                    <h2 className="mt-3 font-display text-3xl font-bold">
                      {lookupRecord?.applicationId}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
                      {workflowSummary.headline}. {workflowSummary.detail}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/10 px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/55">Current stage</p>
                    <p className="mt-2 font-display text-2xl font-bold">
                      {workflowSummary.currentStageLabel}
                    </p>
                    <p className="mt-2 text-sm text-white/70">
                      {workflowSummary.progressPercent}% complete
                    </p>
                  </div>
                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-300 transition-all"
                    style={{ width: `${workflowSummary.progressPercent}%` }}
                  />
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {workflowSummary.stages.map((stage) => (
                    <div
                      key={stage.key}
                      className={`rounded-[1.5rem] border p-5 ${stageToneClasses[stage.state]}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-display text-xl font-bold">{stage.title}</p>
                        <span className="rounded-full border border-current/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
                          {stage.durationLabel}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7">{stage.description}</p>
                      <p className="mt-3 text-sm font-semibold">{stage.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">Payment state</p>
                    <p className="mt-2 text-lg font-semibold">{workflowSummary.paymentStateLabel}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">Invoice amount</p>
                    <p className="mt-2 text-lg font-semibold">
                      {workflowSummary.invoiceDisplay || "Pending review output"}
                    </p>
                  </div>
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[2rem] border border-line bg-white p-8 shadow-panel">
              <div className="flex items-center gap-3">
                <Search className="h-6 w-6 text-leaf" />
                <h2 className="font-display text-3xl font-bold text-pine">Track an application</h2>
              </div>
              <p className="mt-3 text-sm leading-7 text-ink/70">
                Enter your Application ID to view the current review, billing, acquisition,
                laboratory, or certification stage.
              </p>

              <form action={runApplicationStatusLookupAction} className="mt-6 space-y-4">
                <input
                  name="applicationId"
                  required
                  defaultValue={lookupId ?? ""}
                  placeholder="RLP-20260405-ABC123"
                  className="w-full rounded-2xl border border-line px-4 py-3 uppercase outline-none transition focus:border-leaf"
                />
                <button
                  type="submit"
                  className="w-full rounded-full border border-leaf/20 px-5 py-3 text-sm font-bold text-leaf transition hover:border-leaf/40 hover:bg-leaf/5"
                >
                  Check application status
                </button>
              </form>

              {params.lookupError === "missing" ? (
                <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                  Please enter a valid Application ID.
                </div>
              ) : null}

              {lookupId && !lookupRecord ? (
                <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                  No application record was found for <span className="font-semibold">{lookupId}</span>.
                </div>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-line bg-white p-8 shadow-panel">
              <div className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-leaf" />
                <h2 className="font-display text-3xl font-bold text-pine">Start your intake</h2>
              </div>
              <p className="mt-3 text-sm leading-7 text-ink/70">
                This goes directly into the admin review queue. After submission, a unique
                Application ID is issued immediately for customer tracking.
              </p>

              {params.submitted === "1" ? (
                <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  Your application request was received.
                  {params.applicationId ? (
                    <span className="mt-1 block font-semibold">
                      Application ID: {params.applicationId}
                    </span>
                  ) : null}
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
