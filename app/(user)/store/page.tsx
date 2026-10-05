"use client";

// Phase 4 — Resource & Book Store: browse, buy (Stripe), access owned items.
import { useEffect, useState } from "react";

type Product = { id: string; type: string; title: string; price: number; category: string | null; owned: boolean; fileUrl: string | null };
type Purchase = { id: string; amount: number; status: string; product: Product | null; createdAt: string };

const money = (c: number) => `$${(c / 100).toFixed(2)}`;

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") setNotice("Payment received — your item is being unlocked. Watch for a notification.");
    if (params.get("cancelled") === "1") setNotice("Payment cancelled — no charge made.");
    (async () => {
      try {
        const [p, h] = await Promise.all([
          fetch("/api/store/products").then((r) => r.json()),
          fetch("/api/purchases").then((r) => (r.ok ? r.json() : { purchases: [] })),
        ]);
        setProducts(p.products ?? []);
        setHistory((h.purchases ?? []).filter((x: Purchase) => x.product));
      } catch {
        setError("Could not load the store.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function buy(id: string) {
    setError(null);
    const res = await fetch("/api/store/purchase", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId: id }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      window.location.href = "/login?next=/store";
      return;
    }
    if (!res.ok) {
      setError(data.error ?? "Could not start checkout.");
      return;
    }
    if (data.owned) {
      setNotice("Added to your library ✓");
      const p = await fetch("/api/store/products").then((r) => r.json());
      setProducts(p.products ?? []);
    } else if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading the store…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Resource & Book Store</h1>
        <p className="text-sm text-slate-500">Books, courses and downloads curated by your coach.</p>
      </div>

      {notice && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="flex flex-col rounded-xl border p-4">
            <p className="text-xs text-slate-400">{p.type}{p.category ? ` · ${p.category}` : ""}</p>
            <h2 className="mt-1 font-semibold">{p.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{p.price === 0 ? "Free" : money(p.price)}</p>
            <div className="mt-3">
              {p.owned ? (
                p.fileUrl ? (
                  <a href={p.fileUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white">Open ✓</a>
                ) : (
                  <span className="text-sm text-green-700">Owned ✓</span>
                )
              ) : (
                <button onClick={() => void buy(p.id)} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">
                  {p.price === 0 ? "Add to library" : `Buy · ${money(p.price)}`}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Purchase history</h2>
          {history.map((h) => (
            <p key={h.id} className="rounded-xl border p-3 text-sm">
              {h.product?.title} · {money(h.amount)} · {h.status.toLowerCase()} · {new Date(h.createdAt).toLocaleDateString()}
            </p>
          ))}
        </section>
      )}
    </div>
  );
}
