import type { Prisma } from "@prisma/client";

/**
 * “Customer” users for admin analytics: exclude admins and PH workers.
 * `role: { not: "admin" }` alone excludes NULL roles in SQL; include them explicitly.
 */
export const adminAnalyticsClientUserWhere: Prisma.UserWhereInput = {
  worker: { is: null },
  OR: [{ role: null }, { role: { notIn: ["admin", "affiliate"] } }],
};
