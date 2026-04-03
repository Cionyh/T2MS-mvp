import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifyClientAccess } from "@/lib/organization-helpers";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getPublicOrigin, getUploadsRoot, publicUrlForUpload } from "@/lib/widget-upload";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

/** Next.js passes a Blob-like part; Node may not define global `File`, so avoid `instanceof File`. */
function isFormDataFilePart(
  value: unknown
): value is { size: number; type: string; arrayBuffer: () => Promise<ArrayBuffer> } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { arrayBuffer?: unknown }).arrayBuffer === "function" &&
    typeof (value as { size?: unknown }).size === "number"
  );
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: clientId } = await context.params;
    if (!clientId) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    const access = await verifyClientAccess(session.user.id, clientId);
    if (!access.hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!isFormDataFilePart(file)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be 5MB or smaller" },
        { status: 400 }
      );
    }

    let mime = file.type || "";
    if (!mime && typeof (file as { name?: string }).name === "string") {
      const n = (file as { name: string }).name.toLowerCase();
      if (n.endsWith(".jpg") || n.endsWith(".jpeg")) mime = "image/jpeg";
      else if (n.endsWith(".png")) mime = "image/png";
      else if (n.endsWith(".webp")) mime = "image/webp";
      else if (n.endsWith(".gif")) mime = "image/gif";
    }
    const ext = ALLOWED.get(mime);
    if (!ext) {
      return NextResponse.json(
        { error: "Use JPEG, PNG, WebP, or GIF" },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const fileName = `${randomUUID()}${ext}`;
    const dir = path.join(getUploadsRoot(), "widget", clientId);
    await mkdir(dir, { recursive: true });
    const fullPath = path.join(dir, fileName);
    await writeFile(fullPath, buf);

    const relative = `widget/${clientId}/${fileName}`;
    const origin = getPublicOrigin(req);
    const url = publicUrlForUpload(relative, origin || undefined);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[widget-upload]", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
