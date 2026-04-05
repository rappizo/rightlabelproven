import {
  updateApplicationSubmissionStatusAction,
  updateContactSubmissionStatusAction,
} from "@/app/actions";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

const statusOptions = ["NEW", "IN_REVIEW", "RESPONDED", "CLOSED"];

export default async function AdminSubmissionsPage() {
  const admin = await requireAdmin();
  const [contactSubmissions, applicationSubmissions] = await Promise.all([
    prisma.contactSubmission.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.applicationSubmission.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <AdminShell
      adminName={admin.name}
      title="Submissions"
      description="Structured inbound requests from the public site, available for triage and status updates."
    >
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h2 className="font-display text-2xl font-bold">Contact submissions</h2>
        <div className="mt-6 grid gap-4">
          {contactSubmissions.map((submission) => (
            <div key={submission.id} className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5">
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
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white">
                    Save
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h2 className="font-display text-2xl font-bold">Application submissions</h2>
        <div className="mt-6 grid gap-4">
          {applicationSubmissions.map((submission) => (
            <div key={submission.id} className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <p className="font-semibold">
                    {submission.companyName} <span className="text-white/45">/ {submission.contactName}</span>
                  </p>
                  <p className="text-sm text-white/60">
                    {submission.productName} / {submission.productCategory} / {formatDate(submission.createdAt)}
                  </p>
                  <p className="text-sm text-white/70">
                    {submission.email}
                    {submission.phone ? ` / ${submission.phone}` : ""}
                    {submission.website ? ` / ${submission.website}` : ""}
                  </p>
                  <p className="text-sm leading-7 text-white/75">{submission.message}</p>
                </div>
                <form action={updateApplicationSubmissionStatusAction} className="flex gap-3">
                  <input type="hidden" name="id" value={submission.id} />
                  <select
                    name="status"
                    defaultValue={submission.status}
                    className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white">
                    Save
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
