import { prisma } from "@/lib/prisma";

/**
 * Counts the total number of messages for a given user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the total number of messages.
 */
export async function getMessageCountByUserId(userId: string): Promise<number> {
  // Ensure you have a valid userId before querying
  if (!userId) {
    return 0;
  }

  try {
    const count = await prisma.message.count({
      where: {
        // We filter messages based on the userId of the associated client
        client: {
          userId: userId,
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