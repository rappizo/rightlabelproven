import Link from "next/link";
import { Activity, Shield, TestTubeDiagonal } from "lucide-react";

import { SiteShell } from "@/components/site-shell";

const values = [
  {
    title: "Uncompromising neutrality",
    description:
      "We accept no favorable-result fees. Our labs are independent, our review is blind, and our conclusions are binary.",
    icon: Shield,
  },
  {
    title: "Scientific rigor",
    description:
      "We rely on ISO/IEC 17025-accredited methods, including HPLC and mass spectrometry, rather than vague quality checks.",
    icon: TestTubeDiagonal,
  },
  {
    title: "Total transparency",
    description:
      "A seal is only meaningful when it points to evidence. Consumers should be able to verify the existence of a real compliance record.",
    icon: Activity,
  },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-pine to-ocean px-8 py-14 text-white md:px-12">
          <span className="section-eyebrow border-white/15 bg-white/10 text-emerald-200">Who we are</span>
          <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold tracking-tight md:text-6xl">
            Science over marketing.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">
            We do not manufacture supplements and we do not sell them. Right Label Proven exists to
            verify whether the product in someone’s hand actually matches the promise on the label.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6">
        <div className="rounded-[2rem] border border-line bg-white p-8 shadow-panel md:p-10">
          <h2 className="font-display text-3xl font-bold text-pine">The trust gap</h2>
          <p className="mt-6 leading-8 text-ink/72">
            The supplement industry is often described as the Wild West. Pre-market oversight is
            limited, while the consequences of contamination, filler use, or weak potency are
            significant for both consumers and honest brands.
          </p>
          <p className="mt-5 leading-8 text-ink/72">
            Right Label Proven was founded to close that gap. Consumers deserve to know what they are
            putting into their bodies. Legitimate manufacturers deserve a credible way to prove their
            quality and stand apart from the brands cutting corners in the dark.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <article key={value.title} className="rounded-[2rem] border border-line bg-white p-8 shadow-panel">
                <Icon className="h-10 w-10 text-leaf" />
                <h3 className="mt-6 font-display text-2xl font-bold text-pine">{value.title}</h3>
                <p className="mt-4 leading-8 text-ink/72">{value.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-white/70 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-[2rem] border border-line bg-white p-8 shadow-panel md:p-10">
            <h2 className="font-display text-3xl font-bold text-pine">Our commitment to the industry</h2>
            <p className="mt-6 leading-8 text-ink/72">
              We believe third-party verification should become a normal requirement for market
              trust, not a luxury add-on. Until the category catches up, Right Label Proven is
              designed to function as an operational standard-bearer.
            </p>
            <p className="mt-5 leading-8 text-ink/72">
              Whether someone is a consumer seeking safety or a manufacturer seeking validation, the
              mission is the same: replace uncertainty with evidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/verify"
                className="rounded-full bg-leaf px-5 py-3 text-sm font-bold text-white transition hover:bg-pine"
              >
                Verify a product
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-line px-5 py-3 text-sm font-bold text-pine transition hover:bg-mist"
              >
                Contact the team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
