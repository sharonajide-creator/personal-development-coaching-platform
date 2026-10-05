import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const checkSchema = z.object({ email: z.string().email("Enter a valid email.") });

// Public entry check for /start: does this email already have an account?
// Returns only existence — no profile data leaks to anonymous callers.
export async function POST(req: Request) {
  const parsed = checkSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return NextResponse.json({ exists: !!user });
}
