"use client";

// Journey Canvas visual: renders the LLM's spec as a living journey map.
// Every chat message returns an edited spec → this re-renders from it.
import type { VisualSpec } from "@/lib/groq";

const MOOD_BG: Record<VisualSpec["mood"], [string, string]> = {
  dawn: ["#FFF7ED", "#FDBA74"],
  garden: ["#F0FDF4", "#86EFAC"],
  river: ["#EFF6FF", "#93C5FD"],
  stars: ["#1E1B4B", "#7C3AED"],
  mountain: ["#F8FAFC", "#CBD5E1"],
};

const dark = (mood: VisualSpec["mood"]) => mood === "stars";

function points(n: number): { x: number; y: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    return { x: 200 + 120 * Math.sin(t * Math.PI * 1.1 + 0.4), y: 70 + t * 360 };
  });
}

export default function JourneyVisual({ spec, version }: { spec: VisualSpec; version: number }) {
  const pts = points(spec.nodes.length);
  const [c1, c2] = MOOD_BG[spec.mood];
  const darkMode = dark(spec.mood);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <div className="overflow-hidden rounded-2xl border shadow-sm" style={{ background: `linear-gradient(180deg, ${c1}, ${c2}55)` }}>
      <div className="flex items-center justify-between px-4 pt-3">
        <p className={`font-display text-lg font-semibold ${darkMode ? "text-white" : ""}`}>{spec.title}</p>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs text-slate-600">v{version}</span>
      </div>
      <svg viewBox="0 0 400 460" className="w-full">
        <path d={line} fill="none" stroke={darkMode ? "#A78BFA" : "#6C00FF"} strokeWidth={3} strokeDasharray="8 6" opacity={0.6} />
        {pts.map((p, i) => {
          const node = spec.nodes[i];
          const fill = node.state === "done" ? "#FFB800" : node.state === "current" ? "#6C00FF" : darkMode ? "#475569" : "#CBD5E1";
          const label = node.state === "done" ? "✓" : `${i + 1}`;
          const lx = p.x > 200 ? p.x - 118 : p.x + 14;
          return (
            <g key={`${node.label}-${i}`}>
              {node.state === "current" && (
                <circle cx={p.x} cy={p.y} r={24} fill="#6C00FF" opacity={0.15}>
                  <animate attributeName="r" values="20;26;20" dur="2.4s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={p.x} cy={p.y} r={16} fill={fill} />
              <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#fff">{label}</text>
              <text x={lx} y={p.y + 4} fontSize={12} fontWeight={600} fill={darkMode ? "#E2E8F0" : "#334155"}>{node.label}</text>
            </g>
          );
        })}
      </svg>
      <div className="space-y-2 px-4 pb-4">
        <div className="h-2 rounded-full bg-white/60">
          <div className="h-2 rounded-full bg-gradient-to-r from-brand to-accent-gold transition-all" style={{ width: `${spec.progress}%` }} />
        </div>
        <p className={`text-center text-sm italic ${darkMode ? "text-purple-100" : "text-slate-600"}`}>“{spec.affirmation}”</p>
      </div>
    </div>
  );
}
