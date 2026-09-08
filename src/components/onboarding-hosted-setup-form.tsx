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
      <div className="w-full max-w-lg mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Your T2MS announcement page is included
        </h1>
        <div className="mt-3 space-y-3 text-muted-foreground">
          <p>
            Every T2MS plan includes a standalone announcement page in addition
            to your website widget. This gives you a live page you can use
            immediately, even if your website widget has not been installed
            yet.
          </p>
          <p>
            The options below simply let you customize how your announcement
            page looks. If you want to get started quickly, you can use the
            defaults and change these settings later.
          </p>
        </div>
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-amber-600" />
            {siteName}
          </CardTitle>
          <CardDescription>
            Customize your page, or keep the defaults and change this later.
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
