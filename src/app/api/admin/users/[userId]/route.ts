import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { tryGetStripeServerClient } from "@/lib/stripe-config";
import { USER_ROLE } from "@/lib/user-roles";

type Params = { params: Promise<{ userId: string }> };

const ASSIGNABLE_ROLES = new Set<string>([
  USER_ROLE.USER,
  USER_ROLE.ADMIN,
  USER_ROLE.AFFILIATE,
]);

/**
 * PATCH /api/admin/users/[userId]
 * Update a user's role (admin only).
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await params;
    const body = await req.json();
    const role = typeof body.role === "string" ? body.role : "";

    if (!userId || !ASSIGNABLE_ROLES.has(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("[ADMIN_UPDATE_USER_ROLE]", error);
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/[userId]
 * Delete a user and all linked data: subscriptions, sites (in orgs they're sole member),
 * install jobs (via customer), messages, phone numbers, etc.
 * Admin only. Cannot delete self.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.role === "admin" || user.role === "affiliate") {
      return NextResponse.json(
        { error: "This user cannot be deleted from here." },
        { status: 400 }
      );
    }

    // Cancel subscriptions in Stripe first (then we delete records in the transaction)
    const userSubscriptions = await prisma.subscription.findMany({
      where: {
        referenceId: userId,
        stripeSubscriptionId: { not: null },
      },
      select: { id: true, stripeSubscriptionId: true },
    });
    const stripe = tryGetStripeServerClient();
    for (const sub of userSubscriptions) {
      const stripeSubId = sub.stripeSubscriptionId;
      if (!stripeSubId || typeof stripeSubId !== "string") continue;
      if (stripe) {
        try {
          await stripe.subscriptions.cancel(stripeSubId);
        } catch (e) {
          console.warn("[ADMIN_DELETE_USER] Stripe cancel failed for", stripeSubId, e);
          // Continue: we still delete the local record so DB stays consistent
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      // 1. Subscriptions linked to this user (already cancelled in Stripe above)
      await tx.subscription.deleteMany({
        where: { referenceId: userId },
      });

      // 2. Orgs where this user is the only member -> delete their sites (clients)
      const memberships = await tx.member.findMany({
        where: { userId },
        select: { organizationId: true },
      });
      const orgIds = memberships.map((m) => m.organizationId);
      const soleOrgIds: string[] = [];
      for (const orgId of orgIds) {
        const count = await tx.member.count({
          where: { organizationId: orgId },
        });
        if (count === 1) soleOrgIds.push(orgId);
      }
      if (soleOrgIds.length > 0) {
        const clientsToDelete = await tx.client.findMany({
          where: { organizationId: { in: soleOrgIds } },
          select: { id: true },
        });
        const clientIds = clientsToDelete.map((c) => c.id);
        if (clientIds.length > 0) {
          await tx.message.deleteMany({ where: { clientId: { in: clientIds } } });
          await tx.phoneNumber.deleteMany({
            where: { clientId: { in: clientIds } },
          });
          await tx.installJob.updateMany({
            where: { clientId: { in: clientIds } },
            data: { clientId: null },
          });
          await tx.client.deleteMany({ where: { id: { in: clientIds } } });
        }
      }

      // 3. Delete user (cascades: Session, Account, Member, Customer->InstallJob->Proof, Worker, Onboarding, Invitation)
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_DELETE_USER]", error);
    return NextResponse.json(
      { error: "Failed to delete user. Please try again." },
      { status: 500 }
    );
  }
}
