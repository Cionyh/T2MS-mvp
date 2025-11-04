// lib/queries/getWebsites.ts
import { prisma } from "@/lib/prisma";

export async function getWebsitesByOrganizationId(organizationId: string | null) {
  if (!organizationId) {
    return [];
  }
  return prisma.client.findMany({
    where: { organizationId },
    include: {
      phoneNumbers: {
        where: { verified: true },
        select: {
          id: true,
          phone: true,
          verified: true,
        },
      },
    },
  });
}
