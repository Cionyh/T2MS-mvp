"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, CreditCard, Wrench } from "lucide-react";
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
import { INSTALL_TYPE } from "@/lib/job-status";
import { InstallSetupInstructions } from "@/components/install-setup-instructions";

const INSTALL_ADDON_OPTIONS = [
  { id: "standard", name: "Standard website install (script embed)", price: "$9.99 one-time" },
];

const SMS_CONSENT_TEXT =
  "I confirm I have permission to message my contacts using T2MS and understand SMS compliance requirements (TCPA/CTIA).";

const setupSchemaWithSite = z.object({
  installForSiteId: z.string().optional(),
  smsConsentChecked: z.boolean().refine((val) => val === true, {
    message: "You must confirm SMS consent to continue.",
  }),
});

type SetupFormValuesWithSite = z.infer<typeof setupSchemaWithSite>;

function InstallRequestContent() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const jobIdFromUrl = searchParams.get("jobId");
  const clientIdFromUrl = searchParams.get("clientId");
  const [step, setStep] = useState<"choose" | "setup" | "pay">("choose");
  const [jobId, setJobId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [loadingJob, setLoadingJob] = useState(false);
  const [installAddonSku, setInstallAddonSku] = useState<string>("standard");
  const [sites, setSites] = useState<Array<{ id: string; name: string; domain: string }>>([]);
  const [loadingSites, setLoadingSites] = useState(false);

  const setupForm = useForm<SetupFormValuesWithSite>({
    resolver: zodResolver(setupSchemaWithSite),
    defaultValues: {
      installForSiteId: clientIdFromUrl ?? "",
      smsConsentChecked: false,
    },
  });

  // If we have session_id, we're returning from Stripe — verify and redirect to install-requests
  useEffect(() => {
    if (!sessionId || !session?.user?.id) return;
    setVerifying(true);
    fetch(`/api/install-request/confirm?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          toast.success("Payment complete. Your install request is queued.");
          router.replace("/app/install-requests");
        } else {
          toast.error(data.error || "Payment verification failed");
        }
      })
      .catch(() => toast.error("Failed to verify payment"))
      .finally(() => setVerifying(false));
  }, [sessionId, session?.user?.id, router]);

  // If coming from Register Site with a specific clientId, skip plan choice and go to setup
  useEffect(() => {
    if (clientIdFromUrl && !jobIdFromUrl) {
      setStep("setup");
      setupForm.setValue("installForSiteId", clientIdFromUrl);
    }
  }, [clientIdFromUrl, jobIdFromUrl, setupForm]);

  // If we have jobId in URL (e.g. "Complete payment" from install-requests), load job and show payment step
  useEffect(() => {
    if (!jobIdFromUrl || !session?.user?.id) return;
    setLoadingJob(true);
    fetch(`/api/install-request/job/${encodeURIComponent(jobIdFromUrl)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setJobId(data.id);
          setStep("pay");
        } else {
          toast.error(data.error || "Job not found");
        }
      })
      .catch(() => toast.error("Failed to load install request"))
      .finally(() => setLoadingJob(false));
  }, [jobIdFromUrl, session?.user?.id]);

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
      // Free install flow for a newly added site (clientId in URL): no payment
      if (clientIdFromUrl) {
        const res = await fetch("/api/install-request/onboarding-setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: effectiveClientId,
            smsConsentConfirmed: values.smsConsentChecked,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to save install details");
        }
        toast.success("Install details saved. Taking you to your sites.");
        router.replace(`/app/sites?installChoice=1&clientId=${effectiveClientId}`);
        return;
      }

      // Paid install flow: create job with minimal payload, then checkout
      const res = await fetch("/api/install-request/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: effectiveClientId,
          smsConsentConfirmed: values.smsConsentChecked,
          installType: installAddonSku === "standard" ? INSTALL_TYPE.SCRIPT : INSTALL_TYPE.IFRAME,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save install request");
      }
      const newJobId = data.jobId;
      if (!newJobId) {
        toast.error("Missing job ID");
        return;
      }
      const checkoutRes = await fetch("/api/install-request/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          installAddonSku,
          jobId: newJobId,
          successUrl: `${window.location.origin}/app/install-request`,
          cancelUrl: `${window.location.origin}/app/install-request?jobId=${encodeURIComponent(newJobId)}`,
        }),
      });
      const checkoutData = await checkoutRes.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
        return;
      }
      toast.error(checkoutData.error || "Failed to start checkout");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async () => {
    if (!session?.user?.id || !jobId) {
      toast.error("You must be logged in and have an install request.");
      return;
    }
    setPaying(true);
    try {
      const res = await fetch("/api/install-request/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          installAddonSku,
          jobId,
          successUrl: `${window.location.origin}/app/install-request`,
          cancelUrl: `${window.location.origin}/app/install-request?jobId=${encodeURIComponent(jobId)}`,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      toast.error(data.error || "Failed to start checkout");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPaying(false);
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

  // Returning from Stripe: verifying payment
  if (sessionId && verifying) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Verifying payment…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading job from URL (Complete payment from install-requests list)
  if (jobIdFromUrl && loadingJob) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Step 1: Choose install option (first screen — matches the "Get Widget Installed" modal)
  if (step === "choose" && !jobIdFromUrl) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Get Widget Installed
            </CardTitle>
            <CardDescription>
              Choose an install option and pay. After payment you'll provide website and access details.
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

  // Payment screen only when arrived via ?jobId=xxx (Complete payment from list, or cancelled Stripe)
  if (jobIdFromUrl && jobId) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Complete payment
            </CardTitle>
            <CardDescription>
              Choose an install option and pay. Your install request is saved with payment pending.
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
            <Button onClick={handlePay} disabled={paying} className="w-full">
              {paying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to payment…
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay now
                </>
              )}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.push("/app/install-requests")}>
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
            {!clientIdFromUrl &&
              " You will complete payment on the next step. If you leave before paying, your request is saved and you can complete payment later from the install requests list."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!clientIdFromUrl && (
            <div className="mb-6 space-y-2">
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
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
          <div className="rounded-lg border bg-muted/30 p-4 mb-6">
            <InstallSetupInstructions />
          </div>
          <Form {...setupForm}>
            <form onSubmit={setupForm.handleSubmit(handleSetupSubmit)} className="space-y-6">
              <div className="space-y-4 p-4 border-2 rounded-lg bg-muted/50">
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
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setStep("choose")} disabled={submitting}>
                  Back
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : clientIdFromUrl ? (
                    "Submit Install Request"
                  ) : (
                    "Continue to payment"
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
