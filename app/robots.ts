import type { MetadataRoute } from "next";

// Phase 5 — allow indexing of marketing/catalog, block private + admin.
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/paths", "/store"],
        disallow: ["/dashboard", "/assessment", "/goals", "/journal", "/journey", "/ask-coach", "/bookings", "/profile", "/admin", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
