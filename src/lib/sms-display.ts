/** Human-readable T2MS inbound SMS number for UI and emails. */
export function getT2msSmsDisplayNumber(): string {
  const raw = process.env.TWILIO_PHONE_NUMBER?.trim()
  if (!raw) return "+1 (424) 484-8267"

  const digits = raw.replace(/\D/g, "")
  if (digits.length === 11 && digits.startsWith("1")) {
    const area = digits.slice(1, 4)
    const prefix = digits.slice(4, 7)
    const line = digits.slice(7, 11)
    return `+1 (${area}) ${prefix}-${line}`
  }
  if (digits.length === 10) {
    const area = digits.slice(0, 3)
    const prefix = digits.slice(3, 6)
    const line = digits.slice(6, 10)
    return `+1 (${area}) ${prefix}-${line}`
  }
  return raw
}

/** Example SMS format line for onboarding emails (starter = message only). */
export function getSmsFormatExample(keyword: string | null | undefined): string {
  if (keyword?.trim()) {
    return `${keyword.trim().toUpperCase()}: Your announcement here`
  }
  return "Your announcement here"
}
