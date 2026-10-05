"use client";

// Phase 4 — Coaching management: services, availability slots, bookings
// (meeting links, complete/cancel), and the Q&A inbox with replies.
import { useEffect, useState } from "react";

type Service = { id: string; title: string; price: number; durationMin: number; description: string | null };
type Slot = { id: string; startAt: string; endAt: string; isBooked: boolean };
type Booking = {
  id: string; status: string; paymentStatus: string; meetingUrl: string | null; needsDescription: string | null;
  service: { title: string }; slot: { startAt: string }; user: { id: string; name: string; email: string };
};
type Question = {
  id: string; question: string; response: string | null; status: string; resourceLinks: string[];
  user: { id: string; name: string; email: string }; createdAt: string;
};

const money = (c: number) => `$${(c / 100).toFixed(2)}`;

export default function CoachingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sTitle, setSTitle] = useState("");
  const [sPrice, setSPrice] = useState("50");
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [meeting, setMeeting] = useState<Record<string, string>>({});
  const [reply, setReply] = useState<Record<string, { text: string; links: string }>>({});

  async function load() {
    try {
      const [s, sl, b, q] = await Promise.all([
        fetch("/api/admin/services").then((r) => r.json()),
        fetch("/api/admin/slots").then((r) => r.json()),
        fetch("/api/admin/bookings").then((r) => r.json()),
        fetch("/api/admin/questions").then((r) => r.json()),
      ]);
      setServices(s.services ?? []);
      setSlots(sl.slots ?? []);
      setBookings(b.bookings ?? []);
      setQuestions(q.questions ?? []);
    } catch {
      setError("Could not load coaching data.");
    }
  }

  useEffect(() => { void load(); }, []);

  async function createService(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/services", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: sTitle, price: Math.round(Number(sPrice) * 100), durationMin: 60 }),
    });
    if (res.ok) {
      setSTitle(""); setSPrice("50");
      void load();
    } else setError("Could not create service.");
  }

  async function createSlot(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/slots", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ startAt: new Date(slotStart).toISOString(), endAt: new Date(slotEnd).toISOString() }),
    });
    if (res.ok) {
      setSlotStart(""); setSlotEnd("");
      void load();
    } else {
      setError((await res.json()).error ?? "Could not create slot.");
    }
  }

  async function deleteSlot(id: string) {
    const res = await fetch(`/api/admin/slots/${id}`, { method: "DELETE" });
    if (res.ok) void load();
    else setError((await res.json()).error ?? "Could not delete slot.");
  }

  async function saveMeeting(b: Booking) {
    const res = await fetch(`/api/admin/bookings/${b.id}`, {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ meetingUrl: meeting[b.id] ?? "" }),
    });
    if (res.ok) void load();
  }

  async function setStatus(b: Booking, status: string) {
    const res = await fetch(`/api/admin/bookings/${b.id}`, {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) void load();
  }

  async function sendReply(q: Question) {
    const f = reply[q.id];
    if (!f?.text.trim()) return;
    const res = await fetch(`/api/admin/questions/${q.id}/respond`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ response: f.text.trim(), resourceLinks: f.links.split(",").map((s) => s.trim()).filter(Boolean) }),
    });
    if (res.ok) {
      setReply((m) => ({ ...m, [q.id]: { text: "", links: "" } }));
      void load();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <a href="/admin" className="text-sm text-brand underline">← Admin</a>
        <h1 className="mt-1 font-display text-2xl font-semibold">Coaching</h1>
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section className="space-y-2">
        <h2 className="font-semibold">Services</h2>
        {services.map((s) => (
          <p key={s.id} className="rounded-xl border p-3 text-sm">{s.title} · {money(s.price)} · {s.durationMin} min</p>
        ))}
        <form onSubmit={createService} className="flex flex-col gap-2 sm:flex-row">
          <input value={sTitle} onChange={(e) => setSTitle(e.target.value)} placeholder="Service title" required className="flex-1 rounded-lg border px-3 py-2 text-sm" />
          <input value={sPrice} onChange={(e) => setSPrice(e.target.value)} placeholder="$" type="number" min="0" className="w-28 rounded-lg border px-3 py-2 text-sm" />
          <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Add</button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Availability slots</h2>
        {slots.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
            <span>{new Date(s.startAt).toLocaleString()} – {new Date(s.endAt).toLocaleTimeString()} {s.isBooked && <span className="text-slate-400">(booked)</span>}</span>
            {!s.isBooked && <button onClick={() => void deleteSlot(s.id)} className="text-xs text-red-600 underline">Delete</button>}
          </div>
        ))}
        {slots.length === 0 && <p className="text-sm text-slate-500">No upcoming slots — publish times for users to book.</p>}
        <form onSubmit={createSlot} className="flex flex-col gap-2 sm:flex-row">
          <input type="datetime-local" value={slotStart} onChange={(e) => setSlotStart(e.target.value)} required className="rounded-lg border px-3 py-2 text-sm" />
          <input type="datetime-local" value={slotEnd} onChange={(e) => setSlotEnd(e.target.value)} required className="rounded-lg border px-3 py-2 text-sm" />
          <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Publish slot</button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Bookings</h2>
        {bookings.map((b) => (
          <div key={b.id} className="space-y-1 rounded-xl border p-3 text-sm">
            <p className="font-medium">{b.service.title} — {b.user.name} <span className="text-slate-400">({b.status.toLowerCase()} · {b.paymentStatus.toLowerCase()})</span></p>
            <p className="text-slate-500">{new Date(b.slot.startAt).toLocaleString()}</p>
            {b.needsDescription && <p className="text-slate-500">Needs: {b.needsDescription}</p>}
            <div className="flex flex-col gap-2 sm:flex-row">
              <input value={meeting[b.id] ?? b.meetingUrl ?? ""} onChange={(e) => setMeeting((m) => ({ ...m, [b.id]: e.target.value }))} placeholder="Zoom/Meet link" className="flex-1 rounded-lg border px-2 py-1 text-sm" />
              <button onClick={() => void saveMeeting(b)} className="rounded-lg border px-3 py-1 text-sm">Save link</button>
              {b.status === "CONFIRMED" && <button onClick={() => void setStatus(b, "COMPLETED")} className="rounded-lg border px-3 py-1 text-sm">Complete</button>}
              {(b.status === "CONFIRMED" || b.status === "PENDING_PAYMENT") && <button onClick={() => void setStatus(b, "CANCELLED")} className="rounded-lg border px-3 py-1 text-sm text-red-600">Cancel</button>}
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-sm text-slate-500">No bookings yet.</p>}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Q&A inbox</h2>
        {questions.map((q) => (
          <div key={q.id} className="space-y-2 rounded-xl border p-3 text-sm">
            <p className="text-xs text-slate-400">{q.user.name} · {new Date(q.createdAt).toLocaleString()} · {q.status}</p>
            <p><span className="font-medium">Q:</span> {q.question}</p>
            {q.response ? (
              <p className="text-slate-600"><span className="font-medium">A:</span> {q.response}</p>
            ) : (
              <div className="space-y-2">
                <textarea value={reply[q.id]?.text ?? ""} onChange={(e) => setReply((m) => ({ ...m, [q.id]: { text: e.target.value, links: m[q.id]?.links ?? "" } }))} rows={3} placeholder="Guidance for this user…" className="w-full rounded-lg border px-2 py-1 text-sm" />
                <input value={reply[q.id]?.links ?? ""} onChange={(e) => setReply((m) => ({ ...m, [q.id]: { text: m[q.id]?.text ?? "", links: e.target.value } }))} placeholder="Resource links, comma-separated (optional)" className="w-full rounded-lg border px-2 py-1 text-sm" />
                <button onClick={() => void sendReply(q)} className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white">Reply (user is notified)</button>
              </div>
            )}
          </div>
        ))}
        {questions.length === 0 && <p className="text-sm text-slate-500">Inbox zero 🎉</p>}
      </section>
    </div>
  );
}
