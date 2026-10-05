import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/server";
import { VisualSpec, canvasTurn, isGroqConfigured } from "@/lib/groq";

export const dynamic = "force-dynamic";

// Journey Canvas: natural-language box + evolving visual. Stateless — the client
// holds the current spec (localStorage) and sends it back each turn, so every
// message edits the previous version. No DB migration needed.
const turnSchema = z.object({
  message: z.string().min(1).max(1000),
  previousSpec: VisualSpec.nullable().optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Boolean only — the key value never leaves the server.
  return NextResponse.json({ configured: isGroqConfigured() });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isGroqConfigured()) {
    return NextResponse.json(
      { error: "Journey Canvas is not connected yet (GROQ_API_KEY missing on server)." },
      { status: 503 }
    );
  }

  const parsed = turnSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message.", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { reply, spec } = await canvasTurn(parsed.data.message.trim(), parsed.data.previousSpec ?? null);
    return NextResponse.json({ reply, spec });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Canvas failed." }, { status: 502 });
  }
}
