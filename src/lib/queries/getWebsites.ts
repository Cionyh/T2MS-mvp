// lib/queries/getWebsites.ts
import { prisma } from "@/lib/prisma";

export async function getWebsitesByUserId(userId: string) {
  return prisma.client.findMany({
    where: { userId },
  });
}
