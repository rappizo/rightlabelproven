import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Right Label Proven",
    template: "%s | Right Label Proven",
  },
  description:
    "A Next.js rewrite of Right Label Proven with public verification, lead capture, blog publishing, and an internal admin console.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <div className="page-shell">{children}</div>
      </body>
    </html>
  );
}
