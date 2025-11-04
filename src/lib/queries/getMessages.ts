import { prisma } from "@/lib/prisma";

/**
 * Counts the total number of messages for a given organization.
 * @param organizationId The ID of the organization.
 * @returns A promise that resolves to the total number of messages.
 */
export async function getMessageCountByOrganizationId(organizationId: string | null): Promise<number> {
  // Ensure you have a valid organizationId before querying
  if (!organizationId) {
    return 0;
  }

  try {
    const count = await prisma.message.count({
      where: {
        // We filter messages based on the organizationId of the associated client
        client: {
          organizationId: organizationId,
        },
      },
    });
    return count;
  } catch (error) {
    console.error("Failed to fetch message count:", error);
    // Return 0 in case of a database error to prevent the page from crashing
    return 0;
  }
}