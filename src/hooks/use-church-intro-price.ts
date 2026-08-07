"use client"

import { useEffect, useState } from "react"
import {
  CHURCH_INTRO_PRICE_AMOUNT,
  getChurchIntroPriceLabel,
} from "@/lib/church-pricing"

export type ChurchIntroPriceState = {
  /** Formatted label from Stripe, e.g. "$7.99". Null while loading. */
  label: string | null
  amount: number | null
  loading: boolean
  enabled: boolean
}

/**
 * Fetches church partner monthly price from Stripe via /api/church/price
 * (mode-aware: STRIPE_TEST_CHURCH_STARTER_PRICE_ID when LIVE_MODE is off).
 */
export function useChurchIntroPrice(): ChurchIntroPriceState {
  const [label, setLabel] = useState<string | null>(null)
  const [amount, setAmount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/church/price")
        const data = (await res.json()) as {
          label?: string
          amount?: number
          enabled?: boolean
        }
        if (cancelled) return
        if (data.label) {
          setLabel(data.label)
          setAmount(typeof data.amount === "number" ? data.amount : null)
          setEnabled(Boolean(data.enabled))
          return
        }
        setLabel(getChurchIntroPriceLabel())
        setAmount(CHURCH_INTRO_PRICE_AMOUNT)
        setEnabled(false)
      } catch {
        if (cancelled) return
        setLabel(getChurchIntroPriceLabel())
        setAmount(CHURCH_INTRO_PRICE_AMOUNT)
        setEnabled(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return { label, amount, loading, enabled }
}
