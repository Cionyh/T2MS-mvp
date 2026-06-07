/**
 * Validate plan eligibility and persist plan selection before Stripe checkout.
 */
export async function preparePlanCheckout(planId: string): Promise<{
  ok: boolean
  error?: string
}> {
  const validateRes = await fetch("/api/subscription/validate-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planId }),
  })

  if (!validateRes.ok) {
    const data = await validateRes.json().catch(() => ({}))
    return {
      ok: false,
      error:
        typeof data.error === "string"
          ? data.error
          : "Unable to start checkout for this plan.",
    }
  }

  const planRes = await fetch("/api/onboarding/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planId, installAddonSku: null }),
  })

  if (!planRes.ok) {
    const data = await planRes.json().catch(() => ({}))
    return {
      ok: false,
      error:
        typeof data.error === "string" ? data.error : "Failed to save plan.",
    }
  }

  return { ok: true }
}
