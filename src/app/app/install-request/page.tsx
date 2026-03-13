"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, CreditCard, Wrench, Info, Eye, EyeOff } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  { id: "standard", name: "Standard website install (script embed)", price: "$9.99 one-time" },
];

const setupSchema = z
  .object({
    websiteUrl: z.string().url({ message: "Invalid URL format. Include https:// or http://." }),
    platform: z.string().min(1, { message: "Platform selection is required." }),
    platformOther: z.string().optional(),
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
      if (data.platform === "Other") {
        const other = (data.platformOther ?? "").trim();
        return other.length > 0;
      }
      return true;
    },
    { message: "Please specify your platform.", path: ["platformOther"] }
  );

type SetupFormValues = z.infer<typeof setupSchema>;

const SMS_CONSENT_TEXT =
  "I confirm I have permission to message my contacts using T2MS and understand SMS compliance requirements (TCPA/CTIA).";

function LabelWithInfo({ label, info }: { label: string; info: string }) {
  return (
    <div className="flex items-center gap-2">
      <FormLabel>{label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full p-0.5"
            aria-label="More info"
          >
            <Info className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="max-w-xs text-sm" align="start">
          {info}
        </PopoverContent>
      </Popover>
    </div>
  );
}

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
  const [websiteSource, setWebsiteSource] = useState<"manual" | "sites">("manual");
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [sites, setSites] = useState<Array<{ id: string; name: string; domain: string }>>([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [showTempLoginPassword, setShowTempLoginPassword] = useState(false);

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      websiteUrl: "",
      platform: "",
      platformOther: "",
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
    },
  });

  const accessMethod = form.watch("accessMethod");

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
      setWebsiteSource("sites");
      setSelectedSiteId(clientIdFromUrl);
    }
  }, [clientIdFromUrl, jobIdFromUrl]);

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
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setSites(list);
        if (clientIdFromUrl && websiteSource === "sites") {
          const site = list.find((s: any) => s.id === clientIdFromUrl);
          if (site) {
            const url =
              site.domain && typeof site.domain === "string"
                ? site.domain.startsWith("http")
                  ? site.domain
                  : `https://${site.domain}`
                : "";
            if (url) {
              form.setValue("websiteUrl", url);
            }
            setSelectedSiteId(clientIdFromUrl);
          }
        }
      })
      .catch(() => setSites([]))
      .finally(() => setLoadingSites(false));
  }, [step, session?.user?.id, clientIdFromUrl, websiteSource, form]);

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

      const websiteUrl = values.websiteUrl?.trim() || "";
      if (!websiteUrl) {
        toast.error("Website URL is required.");
        return;
      }
      const res = await fetch("/api/install-request/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrls: [websiteUrl],
          clientId: websiteSource === "sites" ? selectedSiteId : undefined,
          platform: values.platform === "Other" ? (values.platformOther || "").trim() : values.platform,
          installType: installAddonSku === "standard" ? INSTALL_TYPE.SCRIPT : INSTALL_TYPE.IFRAME,
          preferredPlacement: values.preferredPlacement || null,
          accessMethod: values.accessMethod,
          accessCredentials,
          notes: values.notes || null,
          smsConsentConfirmed: values.smsConsentChecked,
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
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <LabelWithInfo
                      label="Website URL *"
                      info="Enter the exact website address where you want Text2MySite Widget installed. Example: https://MeYou.index/Events"
                    />
                    <FormDescription>
                      Select an existing site or enter the URL where you want the widget installed.
                    </FormDescription>
                    <div className="space-y-4">
                      <RadioGroup
                        value={websiteSource}
                        onValueChange={(v) => {
                          setWebsiteSource(v as "manual" | "sites");
                          setSelectedSiteId(null);
                          if (v === "sites" && sites.length > 0) {
                            const first = sites[0];
                            const url = first.domain.startsWith("http") ? first.domain : `https://${first.domain}`;
                            field.onChange(url);
                            setSelectedSiteId(first.id);
                          } else if (v === "manual") {
                            field.onChange("");
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
                              value={field.value || ""}
                              onValueChange={(val) => {
                                const site = sites.find((s) => {
                                  const u = s.domain.startsWith("http") ? s.domain : `https://${s.domain}`;
                                  return u === val;
                                });
                                if (site) setSelectedSiteId(site.id);
                                const url = val.startsWith("http") ? val : `https://${val}`;
                                field.onChange(url);
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
                        <FormControl>
                          <Input
                            placeholder="https://example.com"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
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
                    <LabelWithInfo
                      label="Platform *"
                      info='Select the platform your website is built on (WordPress, Wix, Squarespace, etc., or choose "Other").'
                    />
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
                    {field.value === "Other" && (
                      <FormField
                        control={form.control}
                        name="platformOther"
                        render={({ field: otherField }) => (
                          <FormItem className="mt-3">
                            <FormLabel>Specify platform *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Drupal, Magento, custom CMS"
                                {...otherField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installType"
                render={() => (
                  <FormItem>
                    <LabelWithInfo
                      label="Install type *"
                      info="This is pre-selected based on your plan."
                    />
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
                    <LabelWithInfo
                      label="Preferred placement (optional)"
                      info="This will be the standard tickler. Once installed on the site you can customize the configuration."
                    />
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
                    <div className="flex items-center justify-between gap-2">
                      <LabelWithInfo
                        label="Access method *"
                        info="Temporary login: Choose this if you can provide short-term admin access for installation. Admin invite: Select this if your platform allows you to invite Text2MySite as an admin or collaborator. Instructions only: Choose this if you prefer to install the script yourself using our instructions."
                      />
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="text-xs font-medium text-primary underline underline-offset-4 hover:no-underline"
                          >
                            Instructions to allow widget installation
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Instructions to allow widget installation</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 text-sm">
                            <div>
                              <p className="font-semibold">WordPress</p>
                              <ol className="list-decimal list-inside space-y-1 mt-1">
                                <li>Log in to your WordPress dashboard.</li>
                                <li>Go to <strong>Users → Add New User</strong>.</li>
                                <li>Enter: <code>install@t2ms.biz</code>.</li>
                                <li>Set the role to <strong>Administrator</strong>.</li>
                                <li>Click <strong>Add New User</strong>.</li>
                              </ol>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Important: We will not be able to install your widget until we receive the access invitation from WordPress.
                              </p>
                            </div>

                            <div>
                              <p className="font-semibold">Squarespace</p>
                              <ol className="list-decimal list-inside space-y-1 mt-1">
                                <li>Log in to your Squarespace account.</li>
                                <li>Go to <strong>Settings → Permissions</strong>.</li>
                                <li>Click <strong>Invite Contributor</strong>.</li>
                                <li>Enter: <code>install@t2ms.biz</code>.</li>
                                <li>Assign the appropriate admin-level permission needed for installation.</li>
                                <li>Send the invite.</li>
                              </ol>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Important: We will not be able to install your widget until we receive the access invitation from Squarespace.
                              </p>
                            </div>

                            <div>
                              <p className="font-semibold">Wix</p>
                              <ol className="list-decimal list-inside space-y-1 mt-1">
                                <li>Log in to your Wix account.</li>
                                <li>Go to <strong>Settings → Roles &amp; Permissions</strong>.</li>
                                <li>Click <strong>Invite People</strong>.</li>
                                <li>Enter: <code>install@t2ms.biz</code>.</li>
                                <li>Assign admin/editor permissions needed for installation.</li>
                                <li>Send the invite.</li>
                              </ol>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Important: We will not be able to install your widget until we receive the access invitation from Wix.
                              </p>
                            </div>

                            <div>
                              <p className="font-semibold">Shopify</p>
                              <ol className="list-decimal list-inside space-y-1 mt-1">
                                <li>Log in to your Shopify admin.</li>
                                <li>Go to <strong>Settings → Users and Permissions</strong>.</li>
                                <li>Click <strong>Add Staff</strong>.</li>
                                <li>Enter: <code>install@t2ms.biz</code>.</li>
                                <li>Grant the permissions needed for theme/widget installation.</li>
                                <li>Send the invite.</li>
                              </ol>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Important: We will not be able to install your widget until we receive the access invitation from Shopify.
                              </p>
                            </div>

                            <div>
                              <p className="font-semibold">Webflow</p>
                              <ol className="list-decimal list-inside space-y-1 mt-1">
                                <li>Log in to your Webflow account.</li>
                                <li>Open your site settings.</li>
                                <li>Go to workspace/site access settings.</li>
                                <li>Invite <code>install@t2ms.biz</code> with the permissions needed for installation.</li>
                              </ol>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Important: We will not be able to install your widget until we receive the access invitation from Webflow.
                              </p>
                            </div>

                            <div>
                              <p className="font-semibold">GoDaddy Website Builder</p>
                              <ol className="list-decimal list-inside space-y-1 mt-1">
                                <li>Log in to your GoDaddy account.</li>
                                <li>Open your website product/dashboard.</li>
                                <li>Go to user or collaborator access if available.</li>
                                <li>Invite <code>install@t2ms.biz</code> with the permissions needed for installation.</li>
                              </ol>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Important: We will not be able to install your widget until we receive the access invitation from GoDaddy.
                              </p>
                            </div>

                            <div>
                              <p className="font-semibold">Joomla</p>
                              <ol className="list-decimal list-inside space-y-1 mt-1">
                                <li>Log in to your Joomla administrator panel.</li>
                                <li>Go to <strong>Users</strong>.</li>
                                <li>Add a new user with <code>install@t2ms.biz</code>.</li>
                                <li>Assign administrator-level access needed for installation.</li>
                              </ol>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Important: We will not be able to install your widget until we receive the access invitation from Joomla.
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
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
                      <LabelWithInfo
                        label="Admin URL *"
                        info="Tell Text2MySite the https:// (URL) to enter into your website's admin portal."
                      />
                      <FormControl>
                        <Input placeholder="https://yoursite.com/wp-admin" autoComplete="off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tempLoginUsername" render={({ field }) => (
                    <FormItem>
                      <LabelWithInfo
                        label="Username *"
                        info="Enter the username Text2MySite should use to access your site."
                      />
                      <FormControl><Input autoComplete="off" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tempLoginPassword" render={({ field }) => (
                    <FormItem>
                      <LabelWithInfo
                        label="Password *"
                        info="Enter the password Text2MySite should use to access your site. You may change it after installation is complete."
                      />
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showTempLoginPassword ? "text" : "password"}
                            autoComplete="new-password"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowTempLoginPassword(!showTempLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={showTempLoginPassword ? "Hide password" : "Show password"}
                          >
                            {showTempLoginPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tempLoginExpiry" render={({ field }) => (
                    <FormItem>
                      <LabelWithInfo
                        label="Expiry *"
                        info="Let Text2MySite know the date and time when the temporary login access expires."
                      />
                      <FormControl><Input type="datetime-local" autoComplete="off" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {accessMethod === ACCESS_METHOD.ADMIN_INVITE && (
                <div className="space-y-4 pl-6 border-l-2">
                  <FormField control={form.control} name="inviteEmail" render={({ field }) => (
                    <FormItem>
                      <LabelWithInfo
                        label="Invite email *"
                        info="Enter the email address to invite Text2MySite as an admin or collaborator on your platform."
                      />
                      <FormControl><Input type="email" placeholder="installer@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="inviteSender" render={({ field }) => (
                    <FormItem>
                      <LabelWithInfo
                        label="Sender (optional)"
                        info="Email address that will send the invite (e.g. installer@t2ms.com)."
                      />
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
                      <LabelWithInfo
                        label="Instructions *"
                        info="Provide step-by-step instructions for installing the script on your site."
                      />
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
                  <LabelWithInfo
                    label="Notes (optional)"
                    info="Share anything we should know—special instructions, restrictions, or preferences."
                  />
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
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <LabelWithInfo
                          label="SMS consent *"
                          info="Required to confirm you have permission to send text messages using Text2MySite."
                        />
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
