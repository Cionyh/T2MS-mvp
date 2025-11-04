import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Get the organization ID for a given client
 */
export async function getOrganizationForClient(clientId: string): Promise<string | null> {
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { organizationId: true },
    });
    return client?.organizationId || null;
  } catch (error) {
    console.error("Error getting organization for client:", error);
    return null;
  }
}

/**
 * Verify if a user has access to an organization
 * Returns the member role if user has access, null otherwise
 * Uses Prisma to check membership directly from the database
 */
export async function verifyOrganizationAccess(
  userId: string,
  organizationId: string
): Promise<{ hasAccess: boolean; role?: string }> {
  try {
    // Check membership using Prisma - Better Auth creates a 'member' table
    const member = await prisma.$queryRaw<Array<{ role: string }>>`
      SELECT role 
      FROM member 
      WHERE "userId" = ${userId} AND "organizationId" = ${organizationId}
      LIMIT 1
    `;

    if (!member || member.length === 0) {
      return { hasAccess: false };
    }

    return {
      hasAccess: true,
      role: member[0].role,
    };
  } catch (error) {
    console.error("Error verifying organization access:", error);
    return { hasAccess: false };
  }
}

/**
 * Verify if a user has access to a client (via organization)
 */
export async function verifyClientAccess(
  userId: string,
  clientId: string
): Promise<{ hasAccess: boolean; role?: string; organizationId?: string }> {
  try {
    const organizationId = await getOrganizationForClient(clientId);
    
    if (!organizationId) {
      return { hasAccess: false };
    }

    const access = await verifyOrganizationAccess(userId, organizationId);
    
    return {
      ...access,
      organizationId,
    };
  } catch (error) {
    console.error("Error verifying client access:", error);
    return { hasAccess: false };
  }
}

/**
 * Create a default organization for a user if they don't have one
 * Migrates existing clients to the organization
 */
export async function createDefaultOrganizationForUser(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return null;
    }

    // Check if user already has an organization
    const existingOrg = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT o.id 
      FROM organization o
      INNER JOIN member m ON o.id = m."organizationId"
      WHERE m."userId" = ${userId} AND m.role = 'owner'
      LIMIT 1
    `;

    if (existingOrg && existingOrg.length > 0) {
      return existingOrg[0].id;
    }

    // Create organization name from user's name or email
    const orgName = user.name || user.email?.split("@")[0] || "My Organization";
    // Make slug unique by appending timestamp to avoid conflicts
    const baseSlug = orgName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const orgSlug = `${baseSlug}-${Date.now()}`;

    // Generate cuid-like IDs using timestamp and random
    // Better Auth uses cuid() format which is ~25 chars starting with 'c'
    const generateCuid = () => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 15);
      return `c${timestamp}${random}`.substring(0, 25);
    };

    const orgId = generateCuid();
    const memberId = generateCuid();

    // Create organization directly via Prisma
    await prisma.$executeRaw`
      INSERT INTO organization (id, name, slug, "createdAt")
      VALUES (${orgId}, ${orgName}, ${orgSlug}, NOW())
    `;

    // Add user as owner
    await prisma.$executeRaw`
      INSERT INTO member (id, "organizationId", "userId", role, "createdAt")
      VALUES (${memberId}, ${orgId}, ${userId}, 'owner', NOW())
    `;

    // Migrate existing clients without organizationId to this organization
    // Note: This will migrate ALL clients without organizationId
    // For a more precise migration, you'd need additional logic to identify user's clients
    await prisma.client.updateMany({
      where: {
        organizationId: null,
      },
      data: {
        organizationId: orgId,
      },
    });

    // Set as active organization in session
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.session?.id) {
      await prisma.session.update({
        where: { id: session.session.id },
        data: { activeOrganizationId: orgId },
      });
    }

    console.log(`Created default organization ${orgId} for user ${userId}`);
    return orgId;
  } catch (error) {
    console.error("Error creating default organization:", error);
    return null;
  }
}

/**
 * Get the active organization for the current session
 * Automatically creates a default organization if user doesn't have one
 */
export async function getActiveOrganization(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.session?.id || !session?.user?.id) {
      return null;
    }

    // Get active organization from session table
    const sessionData = await prisma.session.findUnique({
      where: { id: session.session.id },
      select: { activeOrganizationId: true },
    });

    if (sessionData?.activeOrganizationId) {
      return sessionData.activeOrganizationId;
    }

    // No active organization - create default one for the user
    const organizationId = await createDefaultOrganizationForUser(session.user.id);
    
    if (organizationId) {
      // Set it as active in the session
      await prisma.session.update({
        where: { id: session.session.id },
        data: { activeOrganizationId: organizationId },
      });
    }

    return organizationId;
  } catch (error) {
    console.error("Error getting active organization:", error);
    return null;
  }
}

/**
 * Check if user has permission to perform an action in an organization
 * Uses Better Auth's permission system
 */
export async function hasOrganizationPermission(
  organizationId: string,
  permissions: Record<string, string[]>
): Promise<boolean> {
  try {
    const result = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions,
      },
    });

    return result.data || false;
  } catch (error) {
    console.error("Error checking organization permission:", error);
    return false;
  }
}

