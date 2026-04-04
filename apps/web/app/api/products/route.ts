import { Decimal } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { mapProduct } from "../../../lib/server-mappers";

export const runtime = "nodejs";

const productSchema = z.object({
  name: z.string().min(1),
  category: z.string().trim().optional().nullable(),
  barcode: z.string().trim().optional().nullable(),
  price: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0).default(0),
  discountPercent: z.coerce.number().min(0).default(0),
  taxPercent: z.coerce.number().min(0).default(0),
  stock: z.coerce.number().int().min(0).default(0),
  minStock: z.coerce.number().int().min(0).default(0)
});

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search")?.trim();

  const products = await prisma.product.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
            { barcode: { contains: search, mode: "insensitive" } }
          ]
        }
      : undefined,
    orderBy: {
      updatedAt: "desc"
    }
  });

  return NextResponse.json(products.map(mapProduct));
}

export async function POST(request: NextRequest) {
  try {
    const body = productSchema.parse(await request.json());
    const product = await prisma.product.create({
      data: {
        name: body.name,
        category: body.category ?? null,
        barcode: body.barcode || null,
        price: new Decimal(body.price),
        costPrice: new Decimal(body.costPrice),
        discountPercent: new Decimal(body.discountPercent),
        taxPercent: new Decimal(body.taxPercent),
        stock: body.stock,
        minStock: body.minStock
      }
    });

    return NextResponse.json(mapProduct(product), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create product";
    return NextResponse.json({ message }, { status: 400 });
  }
}
