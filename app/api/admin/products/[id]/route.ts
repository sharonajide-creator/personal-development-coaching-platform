import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  type: z.enum(["BOOK", "COURSE", "RESOURCE"]).optional(),
  title: z.string().min(2).max(200).optional(),
  price: z.number().int().min(0).max(10000000).optional(),
  fileUrl: z.string().max(500).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  stock: z.number().int().min(0).nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product.", details: parsed.error.flatten() }, { status: 400 });
  }
  const product = await prisma.product.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ product });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const paid = await prisma.purchase.count({ where: { productId: params.id, status: "PAID" } });
  if (paid > 0) return NextResponse.json({ error: "Buyers own this — edit it instead of deleting." }, { status: 400 });
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
