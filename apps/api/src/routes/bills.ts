import { Decimal } from "@prisma/client/runtime/library";
import { z } from "zod";
import type { FastifyPluginAsync } from "fastify";
import { calculateCheckout } from "../lib/billing.js";

const checkoutSchema = z.object({
  paymentMethod: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().positive(),
        price: z.coerce.number().min(0),
        discountPercent: z.coerce.number().min(0),
        taxPercent: z.coerce.number().min(0)
      })
    )
    .min(1)
});

const mapBill = (bill: {
  id: string;
  totalAmount: Decimal;
  discountAmount: Decimal;
  taxAmount: Decimal;
  finalAmount: Decimal;
  paymentMethod: string;
  createdAt: Date;
  items?: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: Decimal;
    discount: Decimal;
    tax: Decimal;
    total: Decimal;
    productName: string;
  }>;
}) => ({
  id: bill.id,
  totalAmount: Number(bill.totalAmount),
  discountAmount: Number(bill.discountAmount),
  taxAmount: Number(bill.taxAmount),
  finalAmount: Number(bill.finalAmount),
  paymentMethod: bill.paymentMethod,
  createdAt: bill.createdAt,
  items:
    bill.items?.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.price),
      discount: Number(item.discount),
      tax: Number(item.tax),
      total: Number(item.total),
      productName: item.productName
    })) ?? []
});

const billRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async () => {
    const bills = await fastify.prisma.bill.findMany({
      include: { items: true },
      orderBy: {
        createdAt: "desc"
      }
    });

    return bills.map(mapBill);
  });

  fastify.get("/:id", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const bill = await fastify.prisma.bill.findUnique({
      where: { id: params.id },
      include: { items: true }
    });

    if (!bill) {
      return reply.code(404).send({ message: "Bill not found" });
    }

    return mapBill(bill);
  });

  fastify.post("/", async (request, reply) => {
    const body = checkoutSchema.parse(request.body);
    const productIds = body.items.map((item) => item.productId);
    const products = await fastify.prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    });

    const productMap = new Map(products.map((product) => [product.id, product]));

    for (const item of body.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return reply.code(400).send({ message: `Product missing: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return reply.code(400).send({
          message: `Not enough stock for ${product.name}`
        });
      }
    }

    const summary = calculateCheckout(body.items);

    const bill = await fastify.prisma.$transaction(async (tx) => {
      const createdBill = await tx.bill.create({
        data: {
          totalAmount: new Decimal(summary.totalAmount),
          discountAmount: new Decimal(summary.discountAmount),
          taxAmount: new Decimal(summary.taxAmount),
          finalAmount: new Decimal(summary.finalAmount),
          paymentMethod: body.paymentMethod
        }
      });

      for (const item of summary.items) {
        const product = productMap.get(item.productId)!;

        await tx.billItem.create({
          data: {
            billId: createdBill.id,
            productId: item.productId,
            quantity: item.quantity,
            price: new Decimal(item.price),
            discount: new Decimal(item.discountAmount),
            tax: new Decimal(item.taxAmount),
            total: new Decimal(item.total),
            productName: product.name
          }
        });

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return tx.bill.findUniqueOrThrow({
        where: {
          id: createdBill.id
        },
        include: {
          items: true
        }
      });
    });

    return reply.code(201).send({
      ...mapBill(bill),
      summary
    });
  });
};

export default billRoutes;
