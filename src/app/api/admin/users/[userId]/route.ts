import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-08-27.basil" });
}

type Params = { params: Promise<{ userId: string }> };

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
    if (user.role === "admin") {
      return NextResponse.json(
        { error: "Admin user cannot be deleted." },
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
    const stripe = getStripe();
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
