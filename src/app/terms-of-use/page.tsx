import { SiteShell } from "@/components/site-shell";

const sections = [
  {
    title: "Intellectual property & trademark rights",
    content:
      "Site copy, code, product registry content, and the RLP Verified mark remain the property of Right Label Proven. Manufacturers may not display the seal without an active license and a valid verification record.",
  },
  {
    title: "Disclaimer of warranties",
    content:
      "Verification reflects the reviewed formulation and lot context available at the time of analysis. It does not constitute medical advice, nor does it guarantee future batches without additional review.",
  },
  {
    title: "Limitation of liability",
    content:
      "To the fullest extent permitted by law, Right Label Proven is not liable for damages arising from product use, third-party misconduct, or unauthorized access beyond the protections reasonably maintained on the platform.",
  },
  {
    title: "Prohibited activities",
    content:
      "Users may not scrape, exploit, falsify affiliation with, or attempt to bypass the security controls of the site or admin console.",
  },
  {
    title: "Governing law",
    content: "These terms are governed by the laws of the State of North Carolina.",
  },
];

export default function TermsPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-pine to-ocean px-8 py-14 text-white md:px-12">
          <span className="section-eyebrow border-white/15 bg-white/10 text-emerald-200">
            Terms of Use
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold md:text-6xl">Terms of use</h1>
          <p className="mt-6 text-lg leading-8 text-white/78">Effective date: January 16, 2026</p>
        </div>
        <div className="mt-10 rounded-[2rem] border border-line bg-white p-8 shadow-panel md:p-10">
          <div className="rounded-[1.5rem] border border-amber-300 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
            Important: this platform provides verification information for informational and
            compliance purposes only. It is not a medical service.
          </div>
          <div className="mt-8 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-2xl font-bold text-pine">{section.title}</h2>
                <p className="mt-3 leading-8 text-ink/72">{section.content}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
