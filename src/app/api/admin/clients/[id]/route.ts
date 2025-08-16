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
    const { name, domain, phone } = body;

    if (!name || !domain || !phone) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: {
        name,
        domain,
        phone,
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
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { messages: true } },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error("[GET_CLIENT]", error);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}
