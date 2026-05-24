import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isValidSetupPath } from "@/lib/setup-path"

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { setupPath } = body as { setupPath?: string }

    if (!isValidSetupPath(setupPath)) {
      return NextResponse.json(
        { error: "setupPath must be hosted_only or embed" },
        { status: 400 }
      )
    }

    await prisma.onboarding.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        planId: "free",
        setupPath,
      },
      update: { setupPath },
    })

    return NextResponse.json({ success: true, setupPath })
  } catch (error) {
    console.error("[onboarding/setup-path]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
