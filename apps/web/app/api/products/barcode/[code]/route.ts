import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertDatabaseConfig } from "../../../../../lib/database-url";
import { getErrorMessage } from "../../../../../lib/errors";
import { prisma } from "../../../../../lib/prisma";
import { mapProduct } from "../../../../../lib/server-mappers";

export const runtime = "nodejs";

const paramsSchema = z.object({
  code: z.string().min(1)
});

export async function GET(
  _request: NextRequest,
  context: {
    params: Promise<{ code: string }>;
  }
) {
  try {
    assertDatabaseConfig();
    const params = paramsSchema.parse(await context.params);
    const product = await prisma.product.findUnique({
      where: {
        barcode: params.code
      }
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(mapProduct(product));
  } catch (error) {
    const message = getErrorMessage(error, "Unable to load product");
    return NextResponse.json({ message }, { status: 500 });
  }
}
