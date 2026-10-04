import type { MetadataRoute } from "next";

// Phase 5 — SEO sitemap (§19). MVP: public marketing + catalog routes only.
// Private routes (dashboard, journal, admin) are intentionally excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/paths`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/store`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];
}
