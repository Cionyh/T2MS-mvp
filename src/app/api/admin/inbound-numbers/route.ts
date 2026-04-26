import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type InboundNumberRow = {
  id: string;
  phone: string;
  normalizedPhone: string;
  label: string | null;
  purpose: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

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

export async function GET(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rows = await prisma.$queryRaw<InboundNumberRow[]>`
      SELECT
        id, phone, "normalizedPhone", label, purpose, "isActive", "createdAt", "updatedAt"
      FROM "inbound_twilio_number"
      ORDER BY "createdAt" DESC
    `;

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("[ADMIN_INBOUND_NUMBERS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as {
      phone?: string;
      label?: string;
      purpose?: "MAIN" | "AFFILIATE";
      isActive?: boolean;
    };

    const phone = body.phone?.trim();
    const normalized = normalizePhoneForCompare(phone);
    if (!phone || !normalized) {
      return NextResponse.json({ error: "Valid phone is required" }, { status: 400 });
    }

    const purpose = body.purpose === "AFFILIATE" ? "AFFILIATE" : "MAIN";
    const isActive = body.isActive !== false;
    const label = body.label?.trim() || null;
    const id = randomUUID();

    try {
      await prisma.$executeRaw`
        INSERT INTO "inbound_twilio_number"
          (id, phone, "normalizedPhone", label, purpose, "isActive", "createdAt", "updatedAt")
        VALUES
          (${id}, ${phone}, ${normalized}, ${label}, ${purpose}, ${isActive}, NOW(), NOW())
      `;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("inbound_twilio_number_normalizedPhone_key")) {
        return NextResponse.json({ error: "This number already exists" }, { status: 409 });
      }
      throw error;
    }

    const [row] = await prisma.$queryRaw<InboundNumberRow[]>`
      SELECT
        id, phone, "normalizedPhone", label, purpose, "isActive", "createdAt", "updatedAt"
      FROM "inbound_twilio_number"
      WHERE id = ${id}
      LIMIT 1
    `;

    return NextResponse.json({ data: row }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_INBOUND_NUMBERS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
