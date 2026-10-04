import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const products = await prisma.product.findMany({ orderBy: { title: "asc" } });
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-semibold">Resource & Book Store</h1>
        <p className="text-sm text-slate-500">Phase 0 seed (Phase 4 adds Stripe purchase + access gating).</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="rounded-xl border p-4">
            <p className="text-xs text-slate-400">{p.type}</p>
            <h2 className="font-semibold">{p.title}</h2>
            <p className="mt-1 text-sm text-slate-500">${(p.price / 100).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
