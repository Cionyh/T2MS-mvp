"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HostedPageSettings } from "@/components/app/hosted-page-settings"
import { Globe } from "lucide-react"
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
  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-lg text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Set up your hosted page
        </h1>
        <p className="mt-2 text-muted-foreground">
          Choose your public web address on t2ms.live — this is the link
          visitors will open in a browser to see your announcements. Your page
          is published by default; you can change that before finishing.
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
        <CardContent>
          <HostedPageSettings
            clientId={clientId}
            siteName={siteName}
            defaultPublishOn
            saveLabel="Save and finish setup"
            saveButtonFullWidth
            onSaved={async ({ hostedSlug }) => {
              if (!hostedSlug?.trim()) {
                toast.error(
                  "Choose a page URL name before finishing setup."
                )
                throw new Error("Missing hosted page URL name")
              }
              await onSuccess()
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
