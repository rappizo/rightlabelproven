import {
  approveApplicationAction,
  issueApplicationInvoiceAction,
  markApplicationPaidAction,
  rejectApplicationAction,
  updateContactSubmissionStatusAction,
} from "@/app/actions";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getApplicationWorkflowSummary } from "@/lib/application-workflow";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

const contactStatusOptions = ["NEW", "IN_REVIEW", "RESPONDED", "CLOSED"];

const stageToneClasses: Record<string, string> = {
  complete: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
  current: "border-sky-400/20 bg-sky-500/10 text-white",
  upcoming: "border-white/10 bg-white/5 text-white/80",
  blocked: "border-white/10 bg-black/10 text-white/45",
};

type AdminSubmissionsPageProps = {
  searchParams: Promise<{ error?: string; invoiced?: string }>;
};

export default async function AdminSubmissionsPage({
  searchParams,
}: AdminSubmissionsPageProps) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const [contactSubmissions, applicationSubmissions] = await Promise.all([
    prisma.contactSubmission.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.applicationSubmission.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <AdminShell
      adminName={admin.name}
      title="Submissions"
      description="Structured inbound requests from the public site, including approval, invoice, payment, and workflow visibility for certification applications."
    >
      {params.error === "invoice-amount" ? (
        <div className="rounded-[1.5rem] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
          Enter a valid invoice amount before issuing payment instructions.
        </div>
      ) : null}

      {params.invoiced === "1" ? (
        <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100">
          Invoice details were saved. Payment delivery hooks can be connected to this action next.
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h2 className="font-display text-2xl font-bold">Contact submissions</h2>
        <div className="mt-6 grid gap-4">
          {contactSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <p className="font-semibold">
                    {submission.name} <span className="text-white/45">/ {submission.email}</span>
                  </p>
                  <p className="text-sm text-white/60">
                    {submission.reason} / {formatDate(submission.createdAt)}
                  </p>
                  <p className="text-sm leading-7 text-white/75">{submission.message}</p>
                </div>
                <form action={updateContactSubmissionStatusAction} className="flex gap-3">
                  <input type="hidden" name="id" value={submission.id} />
                  <select
                    name="status"
                    defaultValue={submission.status}
                    className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm"
                  >
                    {contactStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white"
                  >
                    Save
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Application workflow</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/65">
              Each application record generates an Application ID, moves through approval,
              payment, market purchase, laboratory analysis, and certification, and can be
              tracked publicly from the application page.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          {applicationSubmissions.map((submission) => {
            const workflow = getApplicationWorkflowSummary(submission);
            const canIssueInvoice =
              submission.reviewDecision === "APPROVED" && submission.paymentStatus !== "PAID";

            return (
              <div
                key={submission.id}
                className="rounded-[1.75rem] border border-white/10 bg-black/10 p-6"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
                          {workflow.decisionLabel}
                        </span>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                          {workflow.currentStageLabel}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                          Application ID
                        </p>
                        <h3 className="mt-2 font-display text-3xl font-bold">
                          {submission.applicationId}
                        </h3>
                      </div>
                      <div className="space-y-1 text-sm text-white/70">
                        <p>
                          {submission.companyName} / {submission.contactName}
                        </p>
                        <p>
                          {submission.productName} / {submission.productCategory}
                        </p>
                        <p>
                          {submission.email}
                          {submission.phone ? ` / ${submission.phone}` : ""}
                          {submission.website ? ` / ${submission.website}` : ""}
                        </p>
                        <p>Submitted {formatDate(submission.createdAt)}</p>
                      </div>
                    </div>

                    <div className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                            Workflow progress
                          </p>
                          <p className="mt-2 font-display text-2xl font-bold">
                            {workflow.progressPercent}%
                          </p>
                        </div>
                        <div className="text-right text-sm text-white/65">
                          <p>Payment: {workflow.paymentStateLabel}</p>
                          <p>Invoice: {workflow.invoiceDisplay || "Pending"}</p>
                        </div>
                      </div>
                      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-emerald-400"
                          style={{ width: `${workflow.progressPercent}%` }}
                        />
                      </div>
                      <p className="mt-4 text-sm leading-7 text-white/70">
                        {workflow.headline}. {workflow.detail}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1.3fr_420px]">
                    <div className="grid gap-3 md:grid-cols-2">
                      {workflow.stages.map((stage) => (
                        <div
                          key={stage.key}
                          className={`rounded-[1.25rem] border p-4 ${stageToneClasses[stage.state]}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-display text-xl font-bold">{stage.title}</p>
                            <span className="rounded-full border border-current/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
                              {stage.durationLabel}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-7">{stage.detail}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                          Review controls
                        </p>
                        <p className="mt-2 text-sm leading-7 text-white/65">
                          Approve to start the timed workflow. Reject to close the intake and
                          publish the decision through the Application ID tracker.
                        </p>
                      </div>

                      <form action={approveApplicationAction} className="space-y-3">
                        <input type="hidden" name="id" value={submission.id} />
                        <textarea
                          name="reviewNotes"
                          defaultValue={submission.reviewNotes || ""}
                          rows={3}
                          placeholder="Optional review notes"
                          className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-emerald-400/50"
                        />
                        <button
                          type="submit"
                          className="w-full rounded-full bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-400"
                        >
                          Approve application
                        </button>
                      </form>

                      <form action={rejectApplicationAction} className="space-y-3">
                        <input type="hidden" name="id" value={submission.id} />
                        <textarea
                          name="rejectionReason"
                          defaultValue={submission.rejectionReason || ""}
                          rows={3}
                          placeholder="Reason for rejection"
                          className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-rose-400/50"
                        />
                        <button
                          type="submit"
                          className="w-full rounded-full border border-rose-400/30 px-4 py-3 text-sm font-bold text-rose-100 transition hover:bg-rose-500/10"
                        >
                          Reject application
                        </button>
                      </form>

                      {submission.reviewDecision === "APPROVED" &&
                      submission.paymentStatus !== "PAID" ? (
                        <form action={issueApplicationInvoiceAction} className="space-y-3 border-t border-white/10 pt-4">
                          <input type="hidden" name="id" value={submission.id} />
                          <input
                            type="hidden"
                            name="applicationId"
                            value={submission.applicationId}
                          />
                          <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
                            <input
                              name="invoiceAmount"
                              defaultValue={
                                submission.invoiceAmountCents
                                  ? (submission.invoiceAmountCents / 100).toFixed(2)
                                  : ""
                              }
                              placeholder="Invoice amount"
                              className="rounded-full border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-emerald-400/50"
                            />
                            <input
                              name="currencyCode"
                              defaultValue={submission.currencyCode || "USD"}
                              placeholder="USD"
                              className="rounded-full border border-white/10 bg-slate-950 px-4 py-3 text-sm uppercase outline-none transition focus:border-emerald-400/50"
                            />
                          </div>
                          <input
                            name="invoiceReference"
                            defaultValue={submission.invoiceReference || ""}
                            placeholder="Invoice reference (optional)"
                            className="w-full rounded-full border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-emerald-400/50"
                          />
                          <button
                            type="submit"
                            disabled={!canIssueInvoice}
                            className="w-full rounded-full bg-sky-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Issue payment request
                          </button>
                          <p className="text-xs leading-6 text-white/50">
                            This saves the invoice metadata now. Email delivery and payment gateway
                            hooks can be attached to the same action later.
                          </p>
                        </form>
                      ) : null}

                      {submission.paymentStatus !== "PAID" && submission.invoiceIssuedAt ? (
                        <form action={markApplicationPaidAction}>
                          <input type="hidden" name="id" value={submission.id} />
                          <button
                            type="submit"
                            className="w-full rounded-full border border-emerald-400/30 px-4 py-3 text-sm font-bold text-emerald-100 transition hover:bg-emerald-500/10"
                          >
                            Mark payment received
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}
