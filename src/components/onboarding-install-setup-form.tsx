"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Wrench } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { InstallSetupInstructions } from "@/components/install-setup-instructions";

const SMS_CONSENT_TEXT =
  "I confirm I have permission to message my contacts using T2MS and understand SMS compliance requirements (TCPA/CTIA).";

const PLATFORM_ACCESS_TEXT =
  "I have granted access to the website platform (install@t2ms.biz has been invited).";

const setupSchema = z.object({
  platformAccessChecked: z.boolean().optional(),
  smsConsentChecked: z.boolean().refine((val) => val === true, {
    message: "You must confirm SMS consent to continue.",
  }),
});

type SetupFormValues = z.infer<typeof setupSchema>;

interface OnboardingInstallSetupFormProps {
  clientId: string;
  initialWebsiteUrl: string;
  onSuccess: () => void;
}

export function OnboardingInstallSetupForm({
  clientId,
  initialWebsiteUrl: _initialWebsiteUrl,
  onSuccess,
}: OnboardingInstallSetupFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      platformAccessChecked: false,
      smsConsentChecked: false,
    },
  });

  const handleSubmit = async (values: SetupFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/install-request/onboarding-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          platformAccessConfirmed: values.platformAccessChecked === true,
          smsConsentConfirmed: values.smsConsentChecked,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save install details");
      }
      toast.success("Install details saved. Taking you to your dashboard.");
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wrench className="h-5 w-5 text-amber-600" />
              Install Setup
            </CardTitle>
            <CardDescription>
              Add our installer to your website platform; we&apos;ll complete the installation for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="platformAccessChecked"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border bg-muted/50 p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormDescription className="text-sm">
                          {PLATFORM_ACCESS_TEXT}
                        </FormDescription>
                        <p className="text-xs text-muted-foreground">
                          Optional — you can invite install@t2ms.biz now or after
                          continuing.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="rounded-lg border bg-muted/30 p-4">
                  <InstallSetupInstructions />
                </div>

                <div className="space-y-4 p-4 border-2 rounded-lg bg-muted/50">
                  <FormField
                    control={form.control}
                    name="smsConsentChecked"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormDescription className="text-sm">{SMS_CONSENT_TEXT}</FormDescription>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full rounded-[3em] !bg-amber-600 hover:!bg-amber-700 !text-white">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Continue to Dashboard"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
