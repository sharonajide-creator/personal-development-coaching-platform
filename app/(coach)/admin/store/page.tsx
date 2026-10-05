"use client";

// Phase 4 — Store & Payments: product catalog CRUD + purchases ledger.
import { useEffect, useState } from "react";

type Product = { id: string; type: string; title: string; price: number; fileUrl: string | null; category: string | null; stock: number | null; _count?: { purchases: number } };
type Purchase = {
  id: string; amount: number; status: string; createdAt: string;
  user: { name: string; email: string };
  product: { title: string; type: string } | null;
  booking: { service: { title: string } } | null;
};

const money = (c: number) => `$${(c / 100).toFixed(2)}`;

export default function StoreAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [totals, setTotals] = useState<{ status: string; _sum: { amount: number | null }; _count: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("BOOK");
  const [price, setPrice] = useState("15");
  const [fileUrl, setFileUrl] = useState("");

  async function load() {
    try {
      const [p, pu] = await Promise.all([
        fetch("/api/admin/products").then((r) => r.json()),
        fetch("/api/admin/purchases").then((r) => r.json()),
      ]);
      setProducts(p.products ?? []);
      setPurchases(pu.purchases ?? []);
      setTotals(pu.totals ?? []);
    } catch {
      setError("Could not load store data.");
    }
  }

  useEffect(() => { void load(); }, []);

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/products", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, title, price: Math.round(Number(price) * 100), fileUrl }),
    });
    if (res.ok) {
      setTitle(""); setFileUrl(""); setPrice("15");
      void load();
    } else setError("Could not create product.");
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) void load();
    else setError((await res.json()).error ?? "Could not delete.");
  }

  return (
    <div className="space-y-6">
      <div>
        <a href="/admin" className="text-sm text-brand underline">← Admin</a>
        <h1 className="mt-1 font-display text-2xl font-semibold">Store & Payments</h1>
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section className="space-y-2">
        <h2 className="font-semibold">Catalog</h2>
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
            <span><span className="text-xs text-slate-400">{p.type}</span> <span className="font-medium">{p.title}</span> · {money(p.price)} · {p._count?.purchases ?? 0} sold</span>
            <button onClick={() => void remove(p.id)} className="text-xs text-red-600 underline">Delete</button>
          </div>
        ))}
        <form onSubmit={createProduct} className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-end">
          <label className="text-sm">Type
            <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block rounded-lg border px-2 py-1.5">
              <option value="BOOK">Book</option>
              <option value="COURSE">Course</option>
              <option value="RESOURCE">Resource</option>
            </select>
          </label>
          <label className="flex-1 text-sm">Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 w-full rounded-lg border px-2 py-1.5" />
          </label>
          <label className="text-sm">Price $
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" className="mt-1 w-24 rounded-lg border px-2 py-1.5" />
          </label>
          <label className="flex-1 text-sm">File URL
            <input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="R2 link" className="mt-1 w-full rounded-lg border px-2 py-1.5" />
          </label>
          <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Add</button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Payments ledger</h2>
        <p className="text-xs text-slate-500">
          {totals.map((t) => `${t.status}: ${t._count} (${money(t._sum.amount ?? 0)})`).join(" · ") || "No transactions yet."}
        </p>
        {purchases.map((p) => (
          <div key={p.id} className="rounded-xl border p-3 text-sm">
            <span className="font-medium">{p.product?.title ?? p.booking?.service.title ?? "—"}</span>
            <span className="block text-xs text-slate-500">{p.user.name} · {money(p.amount)} · {p.status} · {new Date(p.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
