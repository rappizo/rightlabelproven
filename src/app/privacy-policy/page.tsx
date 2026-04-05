import { SiteShell } from "@/components/site-shell";

const sections = [
  {
    title: "Information we collect",
    content:
      "When visitors use the verification tool, we store search queries and basic request metadata for security and product analytics. When manufacturers submit for certification, we collect business information, dossier links, and contact details required for review.",
  },
  {
    title: "How we use your information",
    content:
      "We use collected information to verify product authenticity, process certification applications, communicate lab findings, investigate counterfeit usage, and improve operational security across the platform.",
  },
  {
    title: "Data security",
    content:
      "Transport to the application is encrypted. Administrative access is session-protected. The new backend is structured so that submissions, product records, and publishing workflows are separated from the public front end.",
  },
  {
    title: "Third-party sharing",
    content:
      "We do not sell personal information. Operational vendors may process data only as necessary to provide hosting, storage, analytics, or communications required by the service.",
  },
  {
    title: "Contact",
    content:
      "Questions about this policy can be directed to support@rightlabelproven.org.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-pine to-ocean px-8 py-14 text-white md:px-12">
          <span className="section-eyebrow border-white/15 bg-white/10 text-emerald-200">
            Privacy Policy
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold md:text-6xl">Privacy policy</h1>
          <p className="mt-6 text-lg leading-8 text-white/78">Last updated: January 16, 2026</p>
        </div>
        <div className="mt-10 rounded-[2rem] border border-line bg-white p-8 shadow-panel md:p-10">
          <p className="leading-8 text-ink/72">
            At Right Label Proven, trust is the product. This privacy policy explains how the new
            Next.js platform handles visitor activity, manufacturer submissions, and operational
            records.
          </p>
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
