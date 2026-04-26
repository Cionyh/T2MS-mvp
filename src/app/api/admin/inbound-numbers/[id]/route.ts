import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function normalizePhoneForCompare(phone: string | undefined): string | null {
  if (!phone?.trim()) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10) digits = `1${digits}`;
  return digits || null;
}

async function requireAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  return Boolean(session?.user?.id && session.user.role === "admin");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin(req))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = (await req.json()) as {
      phone?: string;
      label?: string;
      purpose?: "MAIN" | "AFFILIATE";
      isActive?: boolean;
    };

    const updates: string[] = [];
    const values: unknown[] = [];

    if (typeof body.phone === "string") {
      const phone = body.phone.trim();
      const normalized = normalizePhoneForCompare(phone);
      if (!phone || !normalized) {
        return NextResponse.json({ error: "Valid phone is required" }, { status: 400 });
      }
      values.push(phone);
      updates.push(`phone = $${values.length}`);
      values.push(normalized);
      updates.push(`"normalizedPhone" = $${values.length}`);
    }

    if (typeof body.label === "string") {
      values.push(body.label.trim() || null);
      updates.push(`label = $${values.length}`);
    }

    if (typeof body.purpose === "string") {
      const purpose = body.purpose === "AFFILIATE" ? "AFFILIATE" : "MAIN";
      values.push(purpose);
      updates.push(`purpose = $${values.length}`);
    }

    if (typeof body.isActive === "boolean") {
      values.push(body.isActive);
      updates.push(`"isActive" = $${values.length}`);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    values.push(id);
    const whereParam = `$${values.length}`;
    const setSql = `${updates.join(", ")}, "updatedAt" = NOW()`;
    const query = `UPDATE "inbound_twilio_number" SET ${setSql} WHERE id = ${whereParam}`;

    try {
      await prisma.$executeRawUnsafe(query, ...values);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("inbound_twilio_number_normalizedPhone_key")) {
        return NextResponse.json({ error: "This number already exists" }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_INBOUND_NUMBERS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin(req))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.$executeRaw`DELETE FROM "inbound_twilio_number" WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_INBOUND_NUMBERS_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
