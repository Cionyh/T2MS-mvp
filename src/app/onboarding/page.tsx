"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { client } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, CreditCard, Globe, ShieldCheck, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PLAN_OPTIONS = [
  { id: "free", name: "Free", price: "$0", description: "Get started with limited features" },
  { id: "starter", name: "Starter", price: "$9.99/mo", description: "Up to 3 websites, 100 messages/month, 14-day free trial" },
  { id: "pro", name: "Pro", price: "Contact for pricing", description: "For growing businesses" },
];

const INSTALL_ADDON_OPTIONS = [
  { id: null, name: "No install add-on", price: null },
  { id: "standard", name: "Standard website install (script embed)", price: "$19.99 one-time" },
  { id: "restricted", name: "Restricted platform (Google Sites / iframe)", price: "$39.99 one-time" },
];

const PLATFORMS = [
  "WordPress",
  "Squarespace",
  "Google Sites",
  "Wix",
  "Shopify",
  "Webflow",
  "Custom / HTML",
  "Other",
];

const installTypeEnum = z.enum(["script", "iframe"] as const, {
  message: "Install type is required",
});
const accessMethodEnum = z.enum(
  ["temporary_login", "admin_invite", "instructions"] as const,
  { message: "Access method is required" }
);

const setupSchema = z.object({
  websiteUrls: z.string().min(1, "At least one website URL is required"),
  platform: z.string().min(1, "Platform is required"),
  installType: installTypeEnum,
  preferredPlacement: z.string().optional(),
  accessMethod: accessMethodEnum,
  notes: z.string().optional(),
});

type SetupFormValues = z.infer<typeof setupSchema>;

/** Request body for /api/onboarding/setup */
interface SetupOnboardingBody {
  websiteUrls: string[];
  platform: string;
  installType: "script" | "iframe";
  preferredPlacement?: string;
  accessMethod: "temporary_login" | "admin_invite" | "instructions";
  notes?: string;
}

/** Request body for /api/onboarding/complete */
interface CompleteOnboardingBody {
  websiteUrls: string[];
  platform: string;
  installType: "script" | "iframe";
  preferredPlacement?: string;
  accessMethod: "temporary_login" | "admin_invite" | "instructions";
  notes?: string;
  smsConsentConfirmed: boolean;
  smsConsentText: string;
}

const SMS_CONSENT_TEXT =
  "I confirm I have permission to message my contacts using T2MS and understand SMS compliance requirements (TCPA/CTIA).";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const sessionId = searchParams.get("session_id");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    completed?: boolean;
    planId?: string;
    installAddonSku?: string | null;
    installAddonStatus?: string | null;
  } | null>(null);
  const [planId, setPlanId] = useState("free");
  const [installAddonSku, setInstallAddonSku] = useState<string | null>(null);
  const [smsConsentChecked, setSmsConsentChecked] = useState(false);
  const [smsConsentTyped, setSmsConsentTyped] = useState("");

  const setupForm = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      websiteUrls: "",
      platform: "",
      installType: "script",
      preferredPlacement: "",
      accessMethod: "instructions",
      notes: "",
    },
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/onboarding/status");
        const data = await res.json();
        if (data.completed) {
          router.replace("/app");
          return;
        }
        setStatus(data);
        if (data.planId) setPlanId(data.planId);
        if (data.installAddonSku) setInstallAddonSku(data.installAddonSku);
      } catch {
        setStatus({});
      }
    };
    fetchStatus();
  }, [router]);

  useEffect(() => {
    const s = stepParam ? parseInt(stepParam, 10) : 1;
    if (s >= 1 && s <= 4) setStep(s);
  }, [stepParam]);

  useEffect(() => {
    if (sessionId && step === 3) {
      fetch("/api/onboarding/confirm-addon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setStatus((prev) => ({ ...prev, installAddonStatus: "paid" }));
            window.history.replaceState({}, "", "/onboarding?step=3");
          }
        })
        .catch(() => {});
    }
  }, [sessionId, step]);

  const handleStep1Continue = async () => {
    setLoading(true);
    try {
      await fetch("/api/onboarding/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, installAddonSku }),
      });
      const needsSubscription = planId !== "free";
      const needsAddonPayment = installAddonSku && installAddonSku !== "";

      if (needsSubscription) {
        const session = await client.getSession();
        const userId = session?.data?.user?.id;
        if (!userId) {
          toast.error("Please sign in to continue.");
          setLoading(false);
          return;
        }
        const successUrl = needsAddonPayment
          ? `${window.location.origin}/onboarding?step=2b`
          : `${window.location.origin}/onboarding?step=3`;
        const { data, error } = await client.subscription.upgrade({
          plan: planId,
          referenceId: userId,
          successUrl,
          cancelUrl: `${window.location.origin}/onboarding?step=1`,
        });
        if (error) {
          toast.error(error.message || "Failed to start checkout");
          setLoading(false);
          return;
        }
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
      }

      if (needsAddonPayment) {
        const res = await fetch("/api/onboarding/checkout-addon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            installAddonSku,
            successUrl: `${window.location.origin}/onboarding?step=3`,
            cancelUrl: `${window.location.origin}/onboarding?step=1`,
          }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        if (data.alreadyPaid) {
          setStep(3);
          setLoading(false);
          return;
        }
      }

      setStep(3);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 2 && searchParams.get("step") === "2b") {
      if (installAddonSku && status?.installAddonStatus !== "paid") {
        fetch("/api/onboarding/checkout-addon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            installAddonSku,
            successUrl: `${window.location.origin}/onboarding?step=3`,
            cancelUrl: `${window.location.origin}/onboarding?step=3`,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.url) window.location.href = data.url;
            else setStep(3);
          })
          .catch(() => setStep(3));
      } else {
        setStep(3);
      }
    }
  }, [step, installAddonSku, status?.installAddonStatus, searchParams]);

  const handleStep3Next = async () => {
    const valid = await setupForm.trigger();
    if (!valid) return;
    setStep(4);
  };

  const handleStep4Submit = async () => {
    if (!smsConsentChecked) {
      toast.error("You must confirm the SMS consent checkbox.");
      return;
    }
    if (smsConsentTyped.trim().toLowerCase() !== SMS_CONSENT_TEXT.toLowerCase()) {
      toast.error("You must type the consent text exactly as shown.");
      return;
    }
    setLoading(true);
    try {
      const values = setupForm.getValues();
      const websiteUrlsArray: string[] = values.websiteUrls
        .split(/[\n,]/)
        .map((u) => u.trim())
        .filter(Boolean);
      const completeBody: CompleteOnboardingBody = {
        websiteUrls: websiteUrlsArray,
        platform: values.platform,
        installType: values.installType,
        preferredPlacement: values.preferredPlacement ?? undefined,
        accessMethod: values.accessMethod,
        notes: values.notes ?? undefined,
        smsConsentConfirmed: true,
        smsConsentText: smsConsentTyped,
      };
      const res = await fetch("/api/onboarding/complete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completeBody),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to complete onboarding");
        setLoading(false);
        return;
      }
      toast.success("Onboarding complete!");
      router.replace("/app");
    } catch {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  if (status === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const steps = [
    { num: 1, label: "Plan & Add-on", icon: CreditCard },
    { num: 2, label: "Payment", icon: CreditCard },
    { num: 3, label: "Setup", icon: Globe },
    { num: 4, label: "SMS Consent", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          {steps.map(({ num, label, icon: Icon }) => (
            <div
              key={num}
              className={cn(
                "flex flex-col items-center gap-1",
                step >= num ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2",
                  step > num && "bg-primary border-primary text-primary-foreground",
                  step === num && "border-primary bg-background",
                  step < num && "border-muted-foreground/30"
                )}
              >
                {step > num ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className="text-xs font-medium hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose your plan</CardTitle>
              <CardDescription>
                Select a monthly subscription and optional install add-on.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-2 block">Monthly subscription</Label>
                <div className="grid gap-3">
                  {PLAN_OPTIONS.map((plan) => (
                    <label
                      key={plan.id}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                        planId === plan.id
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:bg-muted/50"
                      )}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={plan.id}
                        checked={planId === plan.id}
                        onChange={() => setPlanId(plan.id)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium">{plan.name}</p>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                        <p className="text-sm font-medium mt-1">{plan.price}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Optional install add-on</Label>
                <Select
                  value={installAddonSku ?? "none"}
                  onValueChange={(v) => setInstallAddonSku(v === "none" ? null : v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select add-on" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTALL_ADDON_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.id ?? "none"}
                        value={opt.id ?? "none"}
                      >
                        {opt.name} {opt.price != null ? `— ${opt.price}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={handleStep1Continue}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-3 text-muted-foreground">Redirecting to payment…</p>
          </div>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Complete setup</CardTitle>
              <CardDescription>
                Tell us about your website and how we can access it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...setupForm}>
                <form className="space-y-4">
                  <FormField
                    control={setupForm.control}
                    name="websiteUrls"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Website URL(s)</Label>
                        <FormControl>
                          <Textarea
                            placeholder="https://example.com&#10;https://other-site.com"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={setupForm.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Platform</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PLATFORMS.map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={setupForm.control}
                    name="installType"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Install type</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Script or iFrame" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="script">Script embed</SelectItem>
                            <SelectItem value="iframe">iFrame embed (restricted)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={setupForm.control}
                    name="preferredPlacement"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Preferred placement (optional)</Label>
                        <FormControl>
                          <Input placeholder="e.g. bottom-right" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={setupForm.control}
                    name="accessMethod"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Access method</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="How will we access your site?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="temporary_login">Temporary login (URL, username, password, expiry)</SelectItem>
                            <SelectItem value="admin_invite">Admin invite (email)</SelectItem>
                            <SelectItem value="instructions">Instructions only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={setupForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Notes / constraints (optional)</Label>
                        <FormControl>
                          <Textarea placeholder="Any special requirements…" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleStep3Next}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Next: SMS consent"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>SMS consent</CardTitle>
              <CardDescription>
                You must confirm the following to use T2MS for messaging.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="sms-consent"
                  checked={smsConsentChecked}
                  onCheckedChange={(c) => setSmsConsentChecked(c === true)}
                />
                <Label htmlFor="sms-consent" className="text-sm font-normal cursor-pointer">
                  I confirm I have permission to message my contacts using T2MS and understand SMS compliance requirements (TCPA/CTIA).
                </Label>
              </div>
              <div>
                <Label className="mb-2 block">
                  Type the following exactly to confirm:
                </Label>
                <p className="text-sm text-muted-foreground mb-2 p-3 bg-muted/50 rounded-md">
                  {SMS_CONSENT_TEXT}
                </p>
                <Input
                  placeholder="Type the consent text above"
                  value={smsConsentTyped}
                  onChange={(e) => setSmsConsentTyped(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleStep4Submit}
                disabled={loading || !smsConsentChecked}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete onboarding"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
