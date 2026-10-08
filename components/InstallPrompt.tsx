"use client";

// Visible install entry point: an "Install app" banner.
// - Android/desktop Chrome: uses the beforeinstallprompt event (one-tap install).
// - iPhone/iPad: no prompt event exists — shows Share → Add to Home Screen steps.
// - Hides when already installed (standalone mode) or after dismissal (30 days).

import { useEffect, useState } from "react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const KEY = "pwa-install-dismissed-at";
const THIRTY_DAYS = 30 * 24 * 3600 * 1000;

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export default function InstallPrompt() {
  const [bip, setBip] = useState<BIPEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      const at = Number(localStorage.getItem(KEY) ?? 0);
      if (at && Date.now() - at < THIRTY_DAYS) return;
    } catch {
      /* storage blocked — still show */
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setBip(e as BIPEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    // iOS never fires the event — show a gentle nudge instead.
    if (isIos()) {
      const t = setTimeout(() => setVisible(true), 2500);
      return () => {
        window.removeEventListener("beforeinstallprompt", onBip);
        clearTimeout(t);
      };
    }
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  useEffect(() => {
    const onInstalled = () => {
      setVisible(false);
      setBip(null);
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  async function install() {
    if (!bip) {
      setShowIosHelp((s) => !s);
      return;
    }
    await bip.prompt();
    await bip.userChoice.catch(() => undefined);
    setBip(null);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <div className="mx-auto max-w-xl rounded-2xl border bg-white p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand font-display text-xl font-bold text-white">
            H
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Install Her Purpose 📲</p>
            <p className="truncate text-sm text-slate-500">
              {bip || !isIos() ? "One tap — your journey on your home screen." : "Add it to your home screen in seconds."}
            </p>
          </div>
          <button onClick={() => void install()} className="shrink-0 rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white">
            {bip ? "Install" : "How"}
          </button>
          <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 rounded-xl border px-3 py-2 text-sm">
            ✕
          </button>
        </div>
        {showIosHelp && (
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-600">
            <li>Tap the <strong>Share</strong> button in Safari (square with an arrow).</li>
            <li>Scroll and tap <strong>Add to Home Screen</strong>.</li>
            <li>Tap <strong>Add</strong> — Her Purpose opens like a real app.</li>
          </ol>
        )}
      </div>
    </div>
  );
}
