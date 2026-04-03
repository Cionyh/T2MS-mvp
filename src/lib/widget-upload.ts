import path from "path";
import type { NextRequest } from "next/server";

/**
 * Persistent uploads root. On Railway, set UPLOADS_DIR=/uploads to match your volume mount.
 * Locally, defaults to ./uploads under the project cwd.
 */
export function getUploadsRoot(): string {
  return process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
}

/** Prefer NEXT_PUBLIC_APP_URL; otherwise infer from request (local dev / proxies). */
export function getPublicOrigin(req: NextRequest): string {
  const env = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  if (env) return env;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!host) return "";
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

export function publicUrlForUpload(relativePath: string, origin?: string): string {
  const base = (origin || process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  const segments = relativePath
    .split("/")
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join("/");
  const pathPart = `/api/uploads/${segments}`;
  return base ? `${base}${pathPart}` : pathPart;
}
