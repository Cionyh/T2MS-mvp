import { CHURCH_PLAN_ID } from "@/lib/church-pricing"

export type MessageFormatExample = {
  syntax: string
  result: string
  resultClass: string
  label: string
}

const CHURCH_FORMAT_EXAMPLES: MessageFormatExample[] = [
  {
    syntax: "*Sunday Worship*",
    result: "Sunday Worship",
    resultClass: "font-bold",
    label: "Bold/title",
  },
  {
    syntax: "_Join us this Sunday_",
    result: "Join us this Sunday",
    resultClass: "italic",
    label: "Italics",
  },
  {
    syntax: "- Bible Study",
    result: "• Bible Study",
    resultClass: "",
    label: "Bullet",
  },
]

const NEUTRAL_FORMAT_EXAMPLES: MessageFormatExample[] = [
  {
    syntax: "*Weekend sale*",
    result: "Weekend sale",
    resultClass: "font-bold",
    label: "Bold/title",
  },
  {
    syntax: "_Open until 6pm_",
    result: "Open until 6pm",
    resultClass: "italic",
    label: "Italics",
  },
  {
    syntax: "- Free parking",
    result: "• Free parking",
    resultClass: "",
    label: "Bullet",
  },
]

export function getMessageFormatExamples(
  plan?: string | null
): MessageFormatExample[] {
  const normalized = (plan ?? "").toLowerCase().trim()
  if (normalized === CHURCH_PLAN_ID) {
    return CHURCH_FORMAT_EXAMPLES
  }
  return NEUTRAL_FORMAT_EXAMPLES
}

/** Footer placeholder in hosted-page settings — church-only tone for Church Partner. */
export function getHostedFooterPlaceholder(plan?: string | null): string {
  const normalized = (plan ?? "").toLowerCase().trim()
  if (normalized === CHURCH_PLAN_ID) {
    return "Open Sundays · All welcome"
  }
  return ""
}
