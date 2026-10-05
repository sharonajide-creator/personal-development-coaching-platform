import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

const productSchema = z.object({
  type: z.enum(["BOOK", "COURSE", "RESOURCE"]),
  title: z.string().min(2).max(200),
  price: z.number().int().min(0).max(10000000),
  fileUrl: z.string().max(500).optional().default(""),
  category: z.string().max(100).optional().default(""),
  stock: z.number().int().min(0).nullable().optional(),
});

// Phase 4 — Store catalog CRUD: books, courses, downloadable resources.
export async function GET() {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const products = await prisma.product.findMany({
    orderBy: { title: "asc" },
    include: { _count: { select: { purchases: true } } },
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product.", details: parsed.error.flatten() }, { status: 400 });
  }
  const product = await prisma.product.create({
    data: { ...parsed.data, fileUrl: parsed.data.fileUrl || null, category: parsed.data.category || null },
  });
  return NextResponse.json({ product }, { status: 201 });
}
