"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ACCESS_METHOD, INSTALL_TYPE } from "@/lib/job-status";

const PLATFORMS = [
  "WordPress",
  "Squarespace",
  "Google Sites",
  "Wix",
  "Shopify",
  "Webflow",
  "Custom HTML",
  "Other",
] as const;

const INSTALL_ADDON_OPTIONS = [
  { id: "standard", name: "Standard website install (script embed)", price: "$19.99 one-time" },
  { id: "restricted", name: "Restricted platform (Google Sites / iframe)", price: "$39.99 one-time" },
];

const setupSchema = z
  .object({
    websiteUrls: z
      .array(z.string().url({ message: "Invalid URL format. Include https:// or http://." }))
      .min(1, { message: "At least one website URL is required." }),
    platform: z.string().min(1, { message: "Platform selection is required." }),
    installType: z.enum([INSTALL_TYPE.SCRIPT, INSTALL_TYPE.IFRAME]),
    preferredPlacement: z.string().optional(),
    accessMethod: z.enum([
      ACCESS_METHOD.TEMPORARY_LOGIN,
      ACCESS_METHOD.ADMIN_INVITE,
      ACCESS_METHOD.INSTRUCTIONS_ONLY,
    ]),
    tempLoginUrl: z.string().optional(),
    tempLoginUsername: z.string().optional(),
    tempLoginPassword: z.string().optional(),
    tempLoginExpiry: z.string().optional(),
    inviteEmail: z.string().optional(),
    inviteSender: z.string().optional(),
    instructions: z.string().optional(),
    notes: z.string().optional(),
    smsConsentChecked: z.boolean().refine((val) => val === true, {
      message: "You must confirm SMS consent to continue.",
    }),
    smsConsentText: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.accessMethod !== ACCESS_METHOD.TEMPORARY_LOGIN) return;
    const url = data.tempLoginUrl?.trim() ?? "";
    const username = data.tempLoginUsername?.trim() ?? "";
    const password = data.tempLoginPassword?.trim() ?? "";
    const expiry = data.tempLoginExpiry?.trim() ?? "";
    if (!url) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Admin URL is required.", path: ["tempLoginUrl"] });
    if (!username) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Username is required.", path: ["tempLoginUsername"] });
    if (!password) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password is required.", path: ["tempLoginPassword"] });
    if (!expiry) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Expiry date/time is required.", path: ["tempLoginExpiry"] });
  })
  .refine(
    (data) => {
      if (data.accessMethod === ACCESS_METHOD.ADMIN_INVITE) {
        return data.inviteEmail && data.inviteEmail.length > 0;
      }
      return true;
    },
    { message: "Invite email is required.", path: ["inviteEmail"] }
  )
  .refine(
    (data) => {
      if (data.accessMethod === ACCESS_METHOD.INSTRUCTIONS_ONLY) {
        return data.instructions && data.instructions.length > 0;
      }
      return true;
    },
    { message: "Instructions are required.", path: ["instructions"] }
  )
  .refine(
    (data) => {
      if (data.smsConsentChecked) {
        const consentText =
          "I confirm I have permission to message my contacts using T2MS and understand SMS compliance requirements (TCPA/CTIA).";
        return data.smsConsentText === consentText;
      }
      return true;
    },
    { message: "SMS consent text must match exactly.", path: ["smsConsentText"] }
  );

type SetupFormValues = z.infer<typeof setupSchema>;

const SMS_CONSENT_TEXT =
  "I confirm I have permission to message my contacts using T2MS and understand SMS compliance requirements (TCPA/CTIA).";

function InstallRequestContent() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const jobIdFromUrl = searchParams.get("jobId");
  const [step, setStep] = useState<"choose" | "setup" | "pay">("choose");
  const [jobId, setJobId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [loadingJob, setLoadingJob] = useState(false);
  const [installAddonSku, setInstallAddonSku] = useState<string>("standard");
  const [smsConsentText, setSmsConsentText] = useState("");
  const [websiteSource, setWebsiteSource] = useState<"manual" | "sites">("manual");
  const [sites, setSites] = useState<Array<{ id: string; name: string; domain: string }>>([]);
  const [loadingSites, setLoadingSites] = useState(false);

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      websiteUrls: [""],
      platform: "",
      installType: INSTALL_TYPE.SCRIPT,
      preferredPlacement: "",
      accessMethod: ACCESS_METHOD.TEMPORARY_LOGIN,
      tempLoginUrl: "",
      tempLoginUsername: "",
      tempLoginPassword: "",
      tempLoginExpiry: "",
      inviteEmail: "",
      inviteSender: "",
      instructions: "",
      notes: "",
      smsConsentChecked: false,
      smsConsentText: "",
    },
  });

  const accessMethod = form.watch("accessMethod");
  const smsConsentChecked = form.watch("smsConsentChecked");

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

  // Fetch user's sites when on setup step
  useEffect(() => {
    if (step !== "setup" || !session?.user?.id) return;
    setLoadingSites(true);
    fetch("/api/client")
      .then((r) => r.json())
      .then((data) => setSites(Array.isArray(data) ? data : []))
      .catch(() => setSites([]))
      .finally(() => setLoadingSites(false));
  }, [step, session?.user?.id]);

  const addWebsiteUrl = () => {
    const current = form.getValues("websiteUrls");
    form.setValue("websiteUrls", [...current, ""]);
  };
  const removeWebsiteUrl = (index: number) => {
    const current = form.getValues("websiteUrls");
    if (current.length > 1) {
      form.setValue(
        "websiteUrls",
        current.filter((_, i) => i !== index)
      );
    }
  };

  const handleContinue = async (values: SetupFormValues) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in.");
      return;
    }
    setSubmitting(true);
    try {
      let accessCredentials: Record<string, unknown> = {};
      if (values.accessMethod === ACCESS_METHOD.TEMPORARY_LOGIN) {
        accessCredentials = {
          adminUrl: values.tempLoginUrl,
          username: values.tempLoginUsername,
          password: values.tempLoginPassword,
          expiry: values.tempLoginExpiry,
        };
      } else if (values.accessMethod === ACCESS_METHOD.ADMIN_INVITE) {
        accessCredentials = {
          email: values.inviteEmail,
          sender: values.inviteSender || "installer@t2ms.com",
        };
      } else {
        accessCredentials = { steps: values.instructions };
      }

      const res = await fetch("/api/install-request/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrls: values.websiteUrls.filter((u) => u.trim()),
          platform: values.platform,
          installType: installAddonSku === "standard" ? INSTALL_TYPE.SCRIPT : INSTALL_TYPE.IFRAME,
          preferredPlacement: values.preferredPlacement || null,
          accessMethod: values.accessMethod,
          accessCredentials,
          notes: values.notes || null,
          smsConsentText: values.smsConsentText,
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
      // Redirect directly to Stripe (no intermediate payment screen)
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
              onClick={() => {
                // Remember choice: standard → script, restricted → iframe
                form.setValue(
                  "installType",
                  installAddonSku === "standard" ? INSTALL_TYPE.SCRIPT : INSTALL_TYPE.IFRAME
                );
                setStep("setup");
              }}
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

  // Step 2: Setup form
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Install setup
          </CardTitle>
          <CardDescription>
            Provide website and access details. You will complete payment on the next step. If you leave before paying, your request is saved with payment pending and you can complete payment later from the install requests list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleContinue)} className="space-y-6">
              <FormField
                control={form.control}
                name="websiteUrls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL(s) *</FormLabel>
                    <FormDescription>
                      Select an existing site or enter the URL(s) where you want the widget installed.
                    </FormDescription>
                    <div className="space-y-4">
                      <RadioGroup
                        value={websiteSource}
                        onValueChange={(v) => {
                          setWebsiteSource(v as "manual" | "sites");
                          if (v === "sites" && sites.length > 0) {
                            const first = sites[0];
                            const url = first.domain.startsWith("http") ? first.domain : `https://${first.domain}`;
                            field.onChange([url]);
                          } else if (v === "manual") {
                            field.onChange(field.value.length > 0 ? field.value : [""]);
                          }
                        }}
                        className="flex flex-col gap-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sites" id="website-sites" disabled={sites.length === 0} />
                          <Label htmlFor="website-sites" className={sites.length === 0 ? "text-muted-foreground" : ""}>
                            Select from my sites
                            {sites.length > 0 && ` (${sites.length} site${sites.length === 1 ? "" : "s"})`}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="manual" id="website-manual" />
                          <Label htmlFor="website-manual">Enter URL manually</Label>
                        </div>
                      </RadioGroup>

                      {websiteSource === "sites" && (
                        <div className="space-y-2">
                          {loadingSites ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading your sites…
                            </div>
                          ) : sites.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No sites yet.{" "}
                              <Link href="/app/build" className="font-medium text-primary underline underline-offset-4">
                                Register a site
                              </Link>{" "}
                              first, or switch to manual URL entry.
                            </p>
                          ) : (
                            <Select
                              value={field.value[0] || ""}
                              onValueChange={(val) => {
                                const url = val.startsWith("http") ? val : `https://${val}`;
                                field.onChange([url]);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a site" />
                              </SelectTrigger>
                              <SelectContent>
                                {sites.map((site) => {
                                  const url = site.domain.startsWith("http") ? site.domain : `https://${site.domain}`;
                                  return (
                                    <SelectItem key={site.id} value={url}>
                                      {site.name} ({site.domain})
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )}

                      {websiteSource === "manual" && (
                        <div className="space-y-2">
                          {field.value.map((url, index) => (
                            <div key={index} className="flex gap-2">
                              <FormControl>
                                <Input
                                  placeholder="https://example.com"
                                  value={url}
                                  onChange={(e) => {
                                    const next = [...field.value];
                                    next[index] = e.target.value;
                                    field.onChange(next);
                                  }}
                                />
                              </FormControl>
                              {field.value.length > 1 && (
                                <Button type="button" variant="outline" onClick={() => removeWebsiteUrl(index)}>
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button type="button" variant="outline" onClick={addWebsiteUrl}>
                            Add another URL
                          </Button>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform *</FormLabel>
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
                control={form.control}
                name="installType"
                render={() => (
                  <FormItem>
                    <FormLabel>Install type *</FormLabel>
                    <FormControl>
                      <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
                        {installAddonSku === "standard"
                          ? "Script embed (standard)"
                          : "iFrame embed (restricted)"}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Selected from the previous step. To change it, go back.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredPlacement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred placement (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. bottom-right" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accessMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access method *</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={ACCESS_METHOD.TEMPORARY_LOGIN} id="temp-login" />
                          <Label htmlFor="temp-login">Temporary login</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={ACCESS_METHOD.ADMIN_INVITE} id="admin-invite" />
                          <Label htmlFor="admin-invite">Admin invite</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={ACCESS_METHOD.INSTRUCTIONS_ONLY} id="instructions" />
                          <Label htmlFor="instructions">Instructions only</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {accessMethod === ACCESS_METHOD.TEMPORARY_LOGIN && (
                <div className="space-y-4 pl-6 border-l-2">
                  <FormField control={form.control} name="tempLoginUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin URL *</FormLabel>
                      <FormControl>
                        <Input placeholder="https://yoursite.com/wp-admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tempLoginUsername" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tempLoginPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tempLoginExpiry" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry *</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {accessMethod === ACCESS_METHOD.ADMIN_INVITE && (
                <div className="space-y-4 pl-6 border-l-2">
                  <FormField control={form.control} name="inviteEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invite email *</FormLabel>
                      <FormControl><Input type="email" placeholder="installer@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="inviteSender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sender (optional)</FormLabel>
                      <FormControl><Input placeholder="installer@t2ms.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {accessMethod === ACCESS_METHOD.INSTRUCTIONS_ONLY && (
                <div className="pl-6 border-l-2">
                  <FormField control={form.control} name="instructions" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="1. Go to…&#10;2. Click…" className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any constraints or special requirements…" className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="space-y-4 p-4 border-2 rounded-lg bg-muted/50">
                <FormField
                  control={form.control}
                  name="smsConsentChecked"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(c) => {
                            field.onChange(c);
                            if (c) {
                              setSmsConsentText("");
                              form.setValue("smsConsentText", "");
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="font-semibold">SMS consent *</FormLabel>
                        <FormDescription className="text-sm">{SMS_CONSENT_TEXT}</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                {smsConsentChecked && (
                  <FormField
                    control={form.control}
                    name="smsConsentText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type the consent text above to confirm *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Type the consent text exactly as shown…"
                            className="min-h-[80px]"
                            value={smsConsentText}
                            onChange={(e) => {
                              setSmsConsentText(e.target.value);
                              field.onChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
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
