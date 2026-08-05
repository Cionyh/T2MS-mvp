"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HostedPageSettings } from "@/components/app/hosted-page-settings"
import { Loader2, Globe } from "lucide-react"
import { toast } from "sonner"

type OnboardingHostedSetupFormProps = {
  clientId: string
  siteName: string
  onSuccess: () => void | Promise<void>
}

export function OnboardingHostedSetupForm({
  clientId,
  siteName,
  onSuccess,
}: OnboardingHostedSetupFormProps) {
  const [completing, setCompleting] = useState(false)

  const handleContinue = async () => {
    setCompleting(true)
    try {
      const res = await fetch(`/api/client/${clientId}/hosted`)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Could not load hosted page settings")
      }
      if (!data.hostedSlug?.trim()) {
        toast.error("Choose a page URL name and save your hosted page settings first.")
        setCompleting(false)
        return
      }
      await onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-lg text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Set up your hosted page
        </h1>
        <p className="mt-2 text-muted-foreground">
          Choose your public web address on t2ms.live — this is the link
          visitors will open in a browser to see your announcements. You can
          publish the page now or later from your dashboard.
        </p>
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-amber-600" />
            {siteName}
          </CardTitle>
          <CardDescription>
            No widget install required — share this link for live announcements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <HostedPageSettings clientId={clientId} siteName={siteName} />
          <Button
            className="w-full !bg-amber-600 hover:!bg-amber-700 !text-white"
            onClick={handleContinue}
            disabled={completing}
          >
            {completing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Finish setup"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
