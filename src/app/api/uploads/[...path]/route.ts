import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getUploadsRoot } from "@/lib/widget-upload";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await context.params;
    if (!segments?.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const joined = segments.join("/");
    // Serve widget + announcement-page (hosted) uploads only
    if (!joined.startsWith("widget/") && !joined.startsWith("hosted/")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const root = path.resolve(getUploadsRoot());
    const safe = path.normalize(joined).replace(/^(\.\.(\/|\\|$))+/, "");
    if (safe.includes("..") || safe.startsWith("/")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const fullPath = path.join(root, safe);
    const resolved = path.resolve(fullPath);
    if (!resolved.startsWith(root + path.sep) && resolved !== root) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buf = await readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
