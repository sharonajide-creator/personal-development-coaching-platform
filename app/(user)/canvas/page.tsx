"use client";

// Journey Canvas: natural-language box + visual that updates every message.
// Client holds the current spec (localStorage) and sends it back each turn,
// so the AI edits the previous version instead of starting over.
import { useEffect, useRef, useState } from "react";
import type { VisualSpec } from "@/lib/groq";
import JourneyVisual from "@/components/JourneyVisual";

type Msg = { role: "you" | "coach"; text: string };

const STARTERS = [
  "I feel stuck — help me see where I am.",
  "Help me name my strengths.",
  "What should I focus on this week?",
];

export default function CanvasPage() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [spec, setSpec] = useState<VisualSpec | null>(null);
  const [version, setVersion] = useState(0);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/canvas");
        if (r.status === 401) {
          window.location.href = "/login?next=/canvas";
          return;
        }
        setConfigured((await r.json()).configured ?? false);
      } catch {
        setConfigured(false);
      }
      try {
        const saved = localStorage.getItem("canvas-v1");
        if (saved) {
          const { spec: s, version: v, msgs: m } = JSON.parse(saved);
          setSpec(s);
          setVersion(v ?? 0);
          setMsgs(m ?? []);
        }
      } catch {
        /* fresh start */
      }
    })();
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
    try {
      localStorage.setItem("canvas-v1", JSON.stringify({ spec, version, msgs }));
    } catch {
      /* storage full/blocked — session still works */
    }
  }, [spec, version, msgs]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || thinking) return;
    setError(null);
    setMsgs((m) => [...m, { role: "you", text: message }]);
    setInput("");
    setThinking(true);
    try {
      const res = await fetch("/api/canvas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, previousSpec: spec }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Canvas failed.");
      setMsgs((m) => [...m, { role: "coach", text: data.reply }]);
      setSpec(data.spec);
      setVersion((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Canvas failed.");
    } finally {
      setThinking(false);
    }
  }

  function reset() {
    if (!confirm("Start a fresh canvas? Your current visual will be replaced.")) return;
    setSpec(null);
    setVersion(0);
    setMsgs([]);
    localStorage.removeItem("canvas-v1");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Journey Canvas 🎨</h1>
          <p className="text-sm text-slate-500">Describe where you are — watch your visual journey evolve with every message.</p>
        </div>
        {(spec || msgs.length > 0) && (
          <button onClick={reset} className="rounded-xl border px-3 py-1.5 text-sm">Fresh canvas</button>
        )}
      </div>

      {configured === false && (
        <p className="rounded-xl bg-yellow-50 p-3 text-sm text-yellow-800">
          The canvas isn&apos;t connected yet (server key missing). Chat is disabled until it&apos;s configured.
        </p>
      )}
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="lg:sticky lg:top-4 lg:self-start">
          {spec ? (
            <JourneyVisual spec={spec} version={version} />
          ) : (
            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">
              <p className="text-4xl">🪞</p>
              <p className="mt-2 font-medium">Your visual journey will appear here.</p>
              <p>Send your first message — the canvas paints itself from your words, then repaints with every reply.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col rounded-2xl border">
          <div className="max-h-[50vh] flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-slate-500">Try starting with…</p>
                {STARTERS.map((s) => (
                  <button key={s} onClick={() => void send(s)} disabled={configured === false} className="block w-full rounded-xl bg-slate-50 p-3 text-left text-sm hover:bg-purple-50 disabled:opacity-40">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-2xl p-3 text-sm ${m.role === "you" ? "ml-auto bg-brand text-white" : "bg-slate-50"}`}>
                {m.text}
              </div>
            ))}
            {thinking && <p className="text-sm text-slate-400">Painting your next version… ✨</p>}
            <div ref={bottom} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex gap-2 border-t p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Say what's on your heart…"
              maxLength={1000}
              disabled={configured === false || thinking}
              className="flex-1 rounded-xl border px-4 py-2.5 text-sm disabled:opacity-40"
            />
            <button disabled={configured === false || thinking || !input.trim()} className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">
              Send →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
