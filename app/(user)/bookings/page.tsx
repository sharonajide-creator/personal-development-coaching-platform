"use client";

// Phase 3 — 1:1 flow: select service → pick slot → describe needs → pay
// (Stripe Checkout) → confirm. Plus history with reschedule/cancel.
import { useEffect, useState } from "react";

type Service = { id: string; title: string; description: string | null; price: number; durationMin: number };
type Slot = { id: string; startAt: string; endAt: string };
type Booking = {
  id: string; status: string; paymentStatus: string; needsDescription: string | null;
  meetingUrl: string | null; service: Service; slot: Slot;
};

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function BookingsPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [paymentsOn, setPaymentsOn] = useState(true);
  const [loading, setLoading] = useState(true);
  const [serviceId, setServiceId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [needs, setNeeds] = useState("");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") setNotice("Payment received — your booking is being confirmed. Watch for email + notification.");
    if (params.get("cancelled") === "1") setNotice("Payment cancelled — no charge made. Your held slot was released.");
    (async () => {
      try {
        const [s, sl, b] = await Promise.all([
          fetch("/api/services").then((r) => r.json()),
          fetch("/api/slots").then((r) => r.json()),
          fetch("/api/bookings").then((r) => (r.ok ? r.json() : { bookings: [], paymentsEnabled: false })),
        ]);
        setServices(s.services ?? []);
        setSlots(sl.slots ?? []);
        setBookings(b.bookings ?? []);
        setPaymentsOn(b.paymentsEnabled ?? true);
        if (s.services?.length > 0) setServiceId(s.services[0].id);
      } catch {
        setError("Could not load booking options.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function refresh() {
    const b = await fetch("/api/bookings").then((r) => r.json());
    setBookings(b.bookings ?? []);
    const sl = await fetch("/api/slots").then((r) => r.json());
    setSlots(sl.slots ?? []);
  }

  async function onBook(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!serviceId || !slotId) {
      setError("Pick a service and a time.");
      return;
    }
    setBooking(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serviceId, slotId, needsDescription: needs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed.");
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "Booking failed.");
      setBooking(false);
    }
  }

  async function onCancel(id: string) {
    if (!confirm("Cancel this booking?")) return;
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    if (res.ok) void refresh();
  }

  async function onReschedule(id: string) {
    const s = newSlot[id];
    if (!s) {
      setError("Pick a new time first.");
      return;
    }
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reschedule", slotId: s }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? "Reschedule failed.");
    else void refresh();
  }

  if (loading) return <p className="text-sm text-slate-500">Loading booking options…</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">One-on-One Consultations</h1>
        <p className="text-sm text-slate-500">Pick a service, choose a time, share your needs, pay securely.</p>
      </div>

      {notice && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!paymentsOn && (
        <p className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">Online payments aren&apos;t enabled yet — bookings will open once your coach connects Stripe.</p>
      )}

      <form onSubmit={onBook} className="space-y-3 rounded-xl border p-4">
        <label className="block text-sm font-medium">Service
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2">
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.title} · {money(s.price)} · {s.durationMin} min</option>
            ))}
          </select>
        </label>
        {services.find((s) => s.id === serviceId)?.description && (
          <p className="text-xs text-slate-500">{services.find((s) => s.id === serviceId)?.description}</p>
        )}
        <label className="block text-sm font-medium">Available times
          <select value={slotId} onChange={(e) => setSlotId(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2">
            <option value="">— Choose a time —</option>
            {slots.map((s) => (
              <option key={s.id} value={s.id}>{new Date(s.startAt).toLocaleString()} – {new Date(s.endAt).toLocaleTimeString()}</option>
            ))}
          </select>
        </label>
        {slots.length === 0 && <p className="text-xs text-slate-500">No open times right now — check back soon or ask your coach.</p>}
        <label className="block text-sm font-medium">What do you want help with?
          <textarea value={needs} onChange={(e) => setNeeds(e.target.value)} rows={3} placeholder="e.g. I feel stuck choosing between two career paths…" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
        <button disabled={booking || !paymentsOn} className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white disabled:opacity-50">
          {booking ? "Creating secure checkout…" : "Continue to payment →"}
        </button>
      </form>

      <section className="space-y-2">
        <h2 className="font-semibold">My bookings</h2>
        {bookings.length === 0 && <p className="text-sm text-slate-500">No bookings yet.</p>}
        {bookings.map((b) => (
          <div key={b.id} className="space-y-2 rounded-xl border p-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{b.service.title}</p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{b.status.toLowerCase()} · {b.paymentStatus.toLowerCase()}</span>
            </div>
            <p className="text-slate-500">{new Date(b.slot.startAt).toLocaleString()}</p>
            {b.meetingUrl ? (
              <a href={b.meetingUrl} target="_blank" rel="noreferrer" className="font-medium text-brand underline">Join meeting →</a>
            ) : (
              b.status === "CONFIRMED" && <p className="text-xs text-slate-500">Meeting link appears here before your session.</p>
            )}
            {(b.status === "PENDING_PAYMENT" || b.status === "CONFIRMED") && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <select value={newSlot[b.id] ?? ""} onChange={(e) => setNewSlot((m) => ({ ...m, [b.id]: e.target.value }))} className="rounded-lg border px-2 py-1.5 text-sm">
                  <option value="">— New time —</option>
                  {slots.filter((s) => s.id !== b.slot.id).map((s) => (
                    <option key={s.id} value={s.id}>{new Date(s.startAt).toLocaleString()}</option>
                  ))}
                </select>
                <button onClick={() => void onReschedule(b.id)} className="rounded-lg border px-3 py-1.5 text-sm">Reschedule</button>
                <button onClick={() => void onCancel(b.id)} className="text-sm text-red-600 underline">Cancel</button>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
