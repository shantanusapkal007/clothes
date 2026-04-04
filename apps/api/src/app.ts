import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import prismaPlugin from "./plugins/prisma.js";
import productRoutes from "./routes/products.js";
import billRoutes from "./routes/bills.js";

export function buildApp() {
  const app = Fastify({
    logger: true
  });

  app.register(cors, {
    origin: true
  });
  app.register(sensible);
  app.register(prismaPlugin);

  app.get("/health", async () => ({
    status: "ok"
  }));

  app.register(productRoutes, { prefix: "/products" });
  app.register(billRoutes, { prefix: "/bills" });

  return app;
}
