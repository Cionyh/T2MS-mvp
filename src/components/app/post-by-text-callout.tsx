"use client"

import { MessageCircle } from "lucide-react"
import { getT2msSmsDisplayNumber } from "@/lib/sms-display"

type PostByTextCalloutProps = {
  plan: string
  className?: string
}

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
      <div className="space-y-2 text-sm text-amber-900 dark:text-amber-100">
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
      </div>
    </div>
  )
}
