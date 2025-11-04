// src/app/api/admin/clients/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface Params {
  id: string;
}

// Admin-only middleware
const verifyAdmin = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id || session.user.role !== "admin") {
    return null;
  }
  return session.user.id;
};

export async function DELETE(
  req: Request,
  { params }: { params: Params }
) {
  const adminId = await verifyAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const client = await prisma.client.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error("[DELETE_CLIENT]", error);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Params }
) {
  const adminId = await verifyAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { name, domain } = body;

    if (!name || !domain) {
      return NextResponse.json({ error: "Missing fields: name and domain" }, { status: 400 });
    }

    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: {
        name,
        domain,
        // Note: phone field removed - phone numbers are managed separately via PhoneNumber model
      },
    });

    return NextResponse.json({ success: true, client: updatedClient });
  } catch (error) {
    console.error("[UPDATE_CLIENT]", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

// Optional GET endpoint if needed
export async function GET(
  req: Request,
  { params }: { params: Params }
) {
  const adminId = await verifyAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        domain: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
        _count: { select: { messages: true } },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Get organization owner info
    let owner = null;
    if (client.organizationId) {
      const ownerResult = await prisma.$queryRaw<Array<{ id: string; name: string; email: string; role: string | null }>>`
        SELECT u.id, u.name, u.email, u.role
        FROM "user" u
        INNER JOIN member m ON u.id = m."userId"
        WHERE m."organizationId" = ${client.organizationId} AND m.role = 'owner'
        LIMIT 1
      `;
      if (ownerResult && ownerResult.length > 0) {
        owner = ownerResult[0];
      }
    }

    return NextResponse.json({ 
      client: {
        ...client,
        user: owner,
      }
    });
  } catch (error) {
    console.error("[GET_CLIENT]", error);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}
