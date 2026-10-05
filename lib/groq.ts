import { z } from "zod";

// Phase: Journey Canvas — server-only Groq client (key never leaves the server).
// The LLM returns { reply, spec }: a warm coaching reply plus an UPDATED visual
// spec edited from the previous version (not regenerated from scratch).

export const VisualNode = z.object({
  label: z.string().min(1).max(60),
  state: z.enum(["done", "current", "locked"]),
});
export type VisualNode = z.infer<typeof VisualNode>;

export const VisualSpec = z.object({
  title: z.string().min(1).max(80),
  progress: z.number().int().min(0).max(100),
  mood: z.enum(["dawn", "garden", "river", "stars", "mountain"]),
  nodes: z.array(VisualNode).min(3).max(7),
  affirmation: z.string().min(1).max(200),
});
export type VisualSpec = z.infer<typeof VisualSpec>;

const Result = z.object({ reply: z.string().min(1).max(1200), spec: VisualSpec });

const SYSTEM = `You are Her Purpose, a warm Christian purpose coach for girls and women (16–40).
Each user message continues one evolving visual journey. Reply with JSON ONLY:
{ "reply": string, "spec": { "title": string, "progress": 0-100, "mood": "dawn|garden|river|stars|mountain", "nodes": [{label, state}], "affirmation": string } }
Rules:
- reply: 2–4 warm sentences. Faith-friendly, never preachy. End with one gentle question or next step.
- spec is an EDIT of previousSpec (carry its nodes forward, updating states/labels to reflect growth). First message: create 3–5 honest starting nodes (1 current, rest locked; mark done only when the user reports a real win).
- nodes: 3–7 short labels (≤6 words). States flow locked → current → done. Only ONE current at a time.
- progress: honest 0–100 estimate of this journey's unfolding.
- mood: pick the landscape fitting her emotional tone. affirmation: one short line she can hold onto.`;

export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

export async function canvasTurn(message: string, previousSpec: VisualSpec | null): Promise<{ reply: string; spec: VisualSpec }> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured.");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
      temperature: 0.7,
      max_tokens: 1200,
      messages: [
        { role: "system", content: SYSTEM },
        ...(previousSpec
          ? [{ role: "user", content: `Previous visual spec (edit this, do not restart): ${JSON.stringify(previousSpec)}` }]
          : []),
        { role: "user", content: message },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq request failed (${res.status}). Check GROQ_API_KEY and model.`);
  }
  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Groq returned no JSON.");
  const parsed = Result.safeParse(JSON.parse(content.slice(start, end + 1)));
  if (!parsed.success) throw new Error("Groq returned an unexpected shape.");
  return parsed.data;
}
