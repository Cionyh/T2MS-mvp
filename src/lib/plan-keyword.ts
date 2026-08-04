/**
 * Multi-site plans require an SMS keyword so messages can be routed to the right site.
 * Single-site plans (starter, church, free) do not.
 * Safe for client + server import (no Prisma).
 */
export function planRequiresSmsKeyword(plan: string | null | undefined): boolean {
  const p = (plan ?? "free").toLowerCase().trim()
  return p === "pro" || p === "enterprise" || p === "growth"
}
