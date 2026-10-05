import type { Metadata } from "next";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Her Purpose — Discover Yourself. Develop Your Potential. Fulfill Your Purpose.",
    template: "%s · Her Purpose",
  },
  description:
    "Personal development & purpose coaching platform for girls & women 16–40. Guided assessment, personalized paths, 1:1 coaching and growth tracking.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Her Purpose",
    title: "Her Purpose — Discover Yourself. Develop Your Potential. Fulfill Your Purpose.",
    description:
      "Not a library of courses — a personal growth companion guided by a coach. Assess, set goals, follow your path, track growth.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Her Purpose — Discover Yourself. Develop Your Potential. Fulfill Your Purpose.",
    description:
      "Guided assessment, 7 learning paths, 1:1 coaching and growth tracking for girls & women 16–40.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Phase 5: JSON-LD for SEO (§19 homepage) — no PII, static org description only.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Her Purpose",
    description:
      "Personal development & purpose coaching platform for girls & women 16–40.",
    url: appUrl,
  };
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <header className="border-b">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <a href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand font-display text-lg font-bold text-white">
                H
              </span>
              <span className="font-display text-lg font-semibold">Her Purpose</span>
            </a>
            <div className="flex items-center gap-3 text-sm">
              <a href="/dashboard" className="hover:underline">Dashboard</a>
              <a href="/canvas" className="hover:underline">Canvas</a>
              <a href="/paths" className="hover:underline">Paths</a>
              <a href="/store" className="hover:underline">Store</a>
              <a href="/notifications" className="hover:underline">Notifications</a>
              <a href="/admin" className="hover:underline">Coach Admin</a>
              <a href="/login" className="rounded-lg border px-3 py-1.5 hover:bg-slate-50">Log in</a>
              <a href="/start" className="rounded-lg bg-brand px-3 py-1.5 text-white hover:bg-brand-dark">
                Start your Purpose Journey
              </a>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500">
            Her Purpose · Discover Yourself. Develop Your Potential. Fulfill Your Purpose.
          </div>
        </footer>
      </body>
    </html>
  );
}
