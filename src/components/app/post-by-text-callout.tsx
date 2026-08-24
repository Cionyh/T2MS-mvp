"use client"

import { MessageCircle } from "lucide-react"
import { getT2msSmsDisplayNumber } from "@/lib/sms-display"

type PostByTextCalloutProps = {
  plan: string
  className?: string
}

const FORMAT_EXAMPLES = [
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
] as const

export function PostByTextCallout({ plan, className }: PostByTextCalloutProps) {
  const isStarter = plan === "starter" || plan === "free" || !plan
  const textNumber = getT2msSmsDisplayNumber()

  return (
    <div
      className={
        className ??
        "flex gap-3 rounded-lg border border-amber-600/40 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-500/40 px-4 py-3"
      }
    >
      <MessageCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" />
      <div className="min-w-0 flex-1 space-y-2 text-sm text-amber-900 dark:text-amber-100">
        <p className="font-semibold">How to post by text</p>
        <p>
          Text <span className="font-semibold">{textNumber}</span> from your
          verified phone number.
        </p>
        {isStarter ? (
          <p>
            <strong>Send your message only</strong> — no keyword or number
            prefix (do not start with &quot;1:&quot; — that is the phone country
            code, not a site ID).
          </p>
        ) : (
          <p>
            Start with your site&apos;s <strong>SMS keyword</strong>, then your
            message — e.g. <strong>BAKERY: Fresh croissants today</strong>. Each
            site has its own keyword in site settings.
          </p>
        )}
        <p className="text-xs text-amber-800/90 dark:text-amber-200/90">
          <strong>Client ID</strong> (shown on each site card) is for widget
          embed code only — it is not used when texting updates.
        </p>

        <div className="mt-3 space-y-2 border-t border-amber-600/30 pt-3">
          <p className="font-semibold">Message formatting</p>
          <p className="text-xs text-amber-800/90 dark:text-amber-200/90">
            Type these in your SMS. They appear formatted on your announcement
            page and widget. Line breaks in your text are kept.
          </p>
          <div className="overflow-hidden rounded-md border border-amber-600/25 dark:border-amber-500/25">
            {FORMAT_EXAMPLES.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-1 gap-1 border-b border-amber-600/20 px-3 py-2 last:border-b-0 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-3 dark:border-amber-500/20"
              >
                <code className="inline-block w-fit rounded-full bg-zinc-200 px-2.5 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                  {row.syntax}
                </code>
                <span className={`text-sm ${row.resultClass}`}>{row.result}</span>
                <span className="text-xs text-amber-800/80 dark:text-amber-200/80">
                  {row.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
