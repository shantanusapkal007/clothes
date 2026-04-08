import { PrismaClient } from "@prisma/client";
import { getPrismaDatasourceUrl } from "./database-url";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    datasourceUrl: getPrismaDatasourceUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
