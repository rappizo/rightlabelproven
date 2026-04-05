import Link from "next/link";

import { getSiteSettings } from "@/lib/data";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/verify", label: "Verify" },
  { href: "/application", label: "Apply" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/" className="font-display text-xl font-bold tracking-tight text-pine">
            {settings.organizationName}
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-ink/70 transition hover:text-leaf"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="rounded-full border border-leaf/20 px-4 py-2 text-sm font-semibold text-leaf transition hover:border-leaf/40 hover:bg-leaf/5"
            >
              Admin
            </Link>
            <Link
              href="/verify"
              className="rounded-full bg-leaf px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-pine"
            >
              Verify Now
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-20 border-t border-line bg-white/70">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-4">
            <p className="font-display text-2xl font-bold text-pine">{settings.organizationName}</p>
            <p className="max-w-md text-sm leading-7 text-ink/70">
              {settings.footerStatement} We provide public verification data, manufacturer intake,
              and transparent compliance communication.
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-leaf">Explore</p>
            <div className="grid gap-2 text-sm text-ink/70">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-leaf">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-leaf">Contact</p>
            <div className="space-y-2 text-sm text-ink/70">
              <p>{settings.supportEmail}</p>
              <p>{settings.supportPhone}</p>
              <p>{settings.supportHours}</p>
              <p>{settings.addressLine1}</p>
              <p>{settings.addressLine2}</p>
            </div>
            <div className="flex gap-4 text-sm font-semibold text-leaf">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms-of-use">Terms of Use</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
