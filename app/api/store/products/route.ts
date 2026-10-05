import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";

export const dynamic = "force-dynamic";

// Phase 4 — Public store catalog (prices; file access granted only after purchase).
export async function GET() {
  const user = await getSessionUser();
  const products = await prisma.product.findMany({ orderBy: { title: "asc" } });

  let owned = new Set<string>();
  if (user) {
    const rows = await prisma.purchase.findMany({
      where: { userId: user.id, status: "PAID", productId: { not: null } },
      select: { productId: true },
    });
    owned = new Set(rows.map((r) => r.productId as string));
  }

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id, type: p.type, title: p.title, price: p.price, category: p.category,
      owned: owned.has(p.id),
      // Access gating: file URL only for owners (or free items).
      fileUrl: owned.has(p.id) || p.price === 0 ? p.fileUrl : null,
    })),
  });
}
