"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InstallSetupInstructions } from "@/components/install-setup-instructions";

const INSTALL_ADDON_OPTIONS = [
  { id: "standard", name: "Standard website install (script embed)", price: "$9.99 one-time" },
];

const SMS_CONSENT_TEXT =
  "I confirm I have permission to message my contacts using T2MS and understand SMS compliance requirements (TCPA/CTIA).";

const PLATFORM_ACCESS_TEXT =
  "I have granted access to the website platform (install@t2ms.biz has been invited).";

const setupSchemaWithSite = z.object({
  installForSiteId: z.string().optional(),
  platformAccessChecked: z.boolean().refine((val) => val === true, {
    message: "You must confirm you have granted website platform access.",
  }),
  smsConsentChecked: z.boolean().refine((val) => val === true, {
    message: "You must confirm SMS consent to continue.",
  }),
});

type SetupFormValuesWithSite = z.infer<typeof setupSchemaWithSite>;

function InstallRequestContent() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientIdFromUrl = searchParams.get("clientId");
  // Skip the install option screen when only one option exists.
  const [step, setStep] = useState<"choose" | "setup">(
    INSTALL_ADDON_OPTIONS.length > 1 ? "choose" : "setup"
  );
  const [submitting, setSubmitting] = useState(false);
  const [installAddonSku, setInstallAddonSku] = useState<string>("standard");
  const [sites, setSites] = useState<Array<{ id: string; name: string; domain: string }>>([]);
  const [loadingSites, setLoadingSites] = useState(false);

  const setupForm = useForm<SetupFormValuesWithSite>({
    resolver: zodResolver(setupSchemaWithSite),
    defaultValues: {
      installForSiteId: clientIdFromUrl ?? "",
      platformAccessChecked: false,
      smsConsentChecked: false,
    },
  });

  // If coming from Register Site with a specific clientId, go to setup
  useEffect(() => {
    if (clientIdFromUrl) {
      setStep("setup");
      setupForm.setValue("installForSiteId", clientIdFromUrl);
    }
  }, [clientIdFromUrl, setupForm]);

  // Fetch user's sites when on setup step (for "Install for site" dropdown when no clientId in URL)
  useEffect(() => {
    if (step !== "setup" || !session?.user?.id) return;
    setLoadingSites(true);
    fetch("/api/client")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setSites(list);
      })
      .catch(() => setSites([]))
      .finally(() => setLoadingSites(false));
  }, [step, session?.user?.id]);

  const handleSetupSubmit = async (values: SetupFormValuesWithSite) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in.");
      return;
    }
    const effectiveClientId = clientIdFromUrl ?? values.installForSiteId?.trim();
    if (!effectiveClientId) {
      toast.error("Please select a site for this install.");
      return;
    }
    setSubmitting(true);
    try {
      // Create install request immediately (no payment)
      const res = await fetch("/api/install-request/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: effectiveClientId,
          platformAccessConfirmed: values.platformAccessChecked,
          smsConsentConfirmed: values.smsConsentChecked,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create install request");
      }
      if (!data.jobId) {
        toast.error("Missing job ID");
        return;
      }
      toast.success(data.reused ? "Install request already active." : "Install request created.");
      router.replace("/app/install-requests");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!session?.user) {
    router.push("/sign-in");
    return null;
  }

  // Step 1: Choose install option (only shown when multiple options exist)
  if (step === "choose" && INSTALL_ADDON_OPTIONS.length > 1) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Get Widget Installed
            </CardTitle>
            <CardDescription>
              Choose an install option. Then you&apos;ll provide website and access details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-2 block">Install option</Label>
              <div className="grid gap-3">
                {INSTALL_ADDON_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <input
                      type="radio"
                      name="tier"
                      value={opt.id}
                      checked={installAddonSku === opt.id}
                      onChange={() => setInstallAddonSku(opt.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{opt.name}</p>
                      <p className="text-sm text-muted-foreground">{opt.price}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <Button
              onClick={() => setStep("setup")}
              className="w-full"
            >
              Continue
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.push("/app")}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Setup form — instruction text + optional site dropdown + SMS checkbox + Submit
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Install Setup
          </CardTitle>
          <CardDescription>
            Add our installer to your website platform; we&apos;ll complete the installation for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...setupForm}>
            <form onSubmit={setupForm.handleSubmit(handleSetupSubmit)} className="space-y-6">
              {!clientIdFromUrl && (
                <div className="space-y-2">
                  <Label>Install for site</Label>
                  {loadingSites ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading your sites…
                    </div>
                  ) : (
                    <FormField
                      control={setupForm.control}
                      name="installForSiteId"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} value={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a site" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sites.map((site) => (
                                <SelectItem key={site.id} value={site.id}>
                                  {site.name} ({site.domain})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              <div className="rounded-lg border bg-muted/30 p-4">
                <InstallSetupInstructions />
              </div>
              <div className="space-y-4 p-4 border-2 rounded-lg bg-muted/50">
                <FormField
                  control={setupForm.control}
                  name="platformAccessChecked"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
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
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={setupForm.control}
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
              <div className="flex gap-4">
                {INSTALL_ADDON_OPTIONS.length > 1 && !clientIdFromUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("choose")}
                    disabled={submitting}
                  >
                    Back
                  </Button>
                )}
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : clientIdFromUrl ? (
                    "Continue to Dashboard"
                  ) : (
                    "Create install request"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/app")} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function InstallRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <InstallRequestContent />
    </Suspense>
  );
}
