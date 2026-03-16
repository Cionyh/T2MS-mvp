"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { client } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, Zap, Layers, Rocket, Check, Globe, Phone } from "lucide-react";
import { PhoneNumberManagement } from "@/components/app/phone-number-management";
import { OnboardingInstallSetupForm } from "@/components/onboarding-install-setup-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const STARTER_PLAN_FEATURES = [
  "1 Website",
  "100 Messages per Month",
  "Professional Widget Installation (Included)",
  "Priority Support",
  "14-Day Free Trial",
];

const GROWTH_PLAN_FEATURES = [
  "Up to 3 Websites",
  "1–3 Users / Seats",
  "330 Messages per Month",
  "Professional Widget Installation (Included)",
  "Priority Support",
  "14-Day Free Trial",
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successParam = searchParams.get("success");
  const [loading, setLoading] = useState<string | null>(null);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [status, setStatus] = useState<{
    completed: boolean;
    needsSiteRegistration?: boolean;
    needsPhoneVerification?: boolean;
    needsInstallSetup?: boolean;
    firstClientId?: string | null;
  } | null>(null);
  const [phoneStepClientId, setPhoneStepClientId] = useState<string | null>(null);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    domain: "",
    keyword: "",
    phone: "",
    websiteOwnership: false,
  });
  const [verifyCodeDialogOpen, setVerifyCodeDialogOpen] = useState(false);
  const [pendingVerifyClientId, setPendingVerifyClientId] = useState<string | null>(null);
  const [pendingVerifyPhoneId, setPendingVerifyPhoneId] = useState<string | null>(null);
  const [pendingVerifyPhoneDisplay, setPendingVerifyPhoneDisplay] = useState("");
  const [pendingVerifyPhone, setPendingVerifyPhone] = useState(""); // for resend API
  const [verifyCode, setVerifyCode] = useState("");
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [installSetupClientId, setInstallSetupClientId] = useState<string | null>(null);
  const [installSetupWebsiteUrl, setInstallSetupWebsiteUrl] = useState<string>("");
  const [installSetupLoading, setInstallSetupLoading] = useState(false);

  const PENDING_VERIFY_STORAGE_KEY = "t2ms_onboarding_verify_pending";
  const RESEND_COOLDOWN_SECONDS = 60;

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
        setStatusLoaded(true);
        // If install setup is required (e.g. after refresh on install step), show install form
        if (data.needsInstallSetup && data.firstClientId && !installSetupClientId) {
          setInstallSetupClientId(data.firstClientId);
        }
      } catch {
        setStatusLoaded(true);
      }
    };
    fetchStatus();
  }, [router]);

  // Restore pending verify from sessionStorage so dialog shows again after refresh (only when on register step)
  useEffect(() => {
    if (typeof window === "undefined" || !statusLoaded || !status) return;
    const onRegisterStep =
      (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("success") === "1") ||
      status?.needsSiteRegistration === true;
    if (!onRegisterStep) return;
    const raw = sessionStorage.getItem(PENDING_VERIFY_STORAGE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as {
        clientId: string;
        phoneId: string;
        phoneDisplay: string;
        phone: string;
      };
      if (data.clientId && data.phoneId && data.phoneDisplay) {
        setPendingVerifyClientId(data.clientId);
        setPendingVerifyPhoneId(data.phoneId);
        setPendingVerifyPhoneDisplay(data.phoneDisplay);
        setPendingVerifyPhone(data.phone || data.phoneDisplay);
        setVerifyCodeDialogOpen(true);
        setResendCooldownSeconds(0); // allow resend immediately after restore
      }
    } catch {
      sessionStorage.removeItem(PENDING_VERIFY_STORAGE_KEY);
    }
  }, [statusLoaded, status]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldownSeconds <= 0) return;
    const t = setInterval(() => {
      setResendCooldownSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldownSeconds]);

  // After Stripe success: show register-site step (do NOT call complete until site is registered)

  const handlePaidPlan = async (planId: "starter" | "pro") => {
    setLoading(planId);
    try {
      const planRes = await fetch("/api/onboarding/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, installAddonSku: null }),
      });
      if (!planRes.ok) {
        toast.error("Failed to save plan.");
        setLoading(null);
        return;
      }

      const session = await client.getSession();
      const userId = session?.data?.user?.id;
      if (!userId) {
        toast.error("Please sign in to continue.");
        setLoading(null);
        return;
      }

      const { data, error } = await client.subscription.upgrade({
        plan: planId,
        referenceId: userId,
        successUrl: `${window.location.origin}/onboarding?success=1`,
        cancelUrl: `${window.location.origin}/onboarding`,
      });

      if (error) {
        toast.error(error.message || "Failed to start checkout");
        setLoading(null);
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const handleEnterpriseContact = () => {
    window.location.href = "mailto:sales@t2ms.biz";
  };

  const isStarterPlan = status?.planId === "starter";

  const handleRegisterSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name.trim() || !registerForm.domain.trim()) {
      toast.error("Please enter a business name and domain.");
      return;
    }
    if (!isStarterPlan) {
      const rawKeyword = registerForm.keyword.trim();
      if (!rawKeyword) {
        toast.error("Please enter a keyword (e.g. BAKERY). You'll text KEYWORD: your message to post to this site.");
        return;
      }
      if (!/^[A-Za-z0-9_]{1,50}$/.test(rawKeyword)) {
        toast.error("Keyword must be 1–50 characters, letters, numbers, or underscore only.");
        return;
      }
    }
    if (!registerForm.phone.trim()) {
      toast.error("Please enter a phone number.");
      return;
    }
    if (!registerForm.websiteOwnership) {
      toast.error("Please acknowledge that you own or have rights to this website.");
      return;
    }
    setLoading("register");
    try {
      const clientRes = await fetch("/api/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerForm.name.trim(),
          domain: registerForm.domain.trim(),
          ...(isStarterPlan ? {} : { keyword: registerForm.keyword.trim() }),
          phone: registerForm.phone.trim(),
        }),
      });
      const clientData = await clientRes.json();
      if (!clientRes.ok) {
        throw new Error(clientData.error || "Failed to register site");
      }

      const clientId = clientData.id as string;

      const addPhoneRes = await fetch(`/api/client/${clientId}/phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: registerForm.phone.trim() }),
      });
      if (!addPhoneRes.ok) {
        const addErr = await addPhoneRes.json();
        throw new Error(addErr.error || "Failed to add phone number");
      }
      const addPhoneData = await addPhoneRes.json();
      const phoneRecord = addPhoneData.phoneNumber as { id: string; phone: string };

      const verifyRes = await fetch("/api/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          phone: registerForm.phone.trim(),
        }),
      });
      if (!verifyRes.ok) {
        const verifyErr = await verifyRes.json();
        throw new Error(verifyErr.error || "Failed to send verification code");
      }

      toast.success("Verification code sent via SMS.");
      const phoneForResend = registerForm.phone.trim();
      setPendingVerifyClientId(clientId);
      setPendingVerifyPhoneId(phoneRecord.id);
      setPendingVerifyPhoneDisplay(phoneRecord.phone);
      setPendingVerifyPhone(phoneForResend);
      setVerifyCode("");
      setResendCooldownSeconds(RESEND_COOLDOWN_SECONDS);
      setVerifyCodeDialogOpen(true);
      sessionStorage.setItem(
        PENDING_VERIFY_STORAGE_KEY,
        JSON.stringify({
          clientId,
          phoneId: phoneRecord.id,
          phoneDisplay: phoneRecord.phone,
          phone: phoneForResend,
        })
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const handleVerifyCodeSubmit = async () => {
    if (!pendingVerifyPhoneId || !verifyCode.trim()) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }
    if (verifyCode.replace(/\D/g, "").length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }
    setIsVerifyingCode(true);
    try {
      const res = await fetch("/api/phone/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumberId: pendingVerifyPhoneId,
          pinCode: verifyCode.replace(/\D/g, ""),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Invalid verification code");
      }

      toast.success("Phone verified! Next, complete the install setup.");
      sessionStorage.removeItem(PENDING_VERIFY_STORAGE_KEY);
      const clientIdToRedirect = pendingVerifyClientId;
      setVerifyCodeDialogOpen(false);
      setPendingVerifyClientId(null);
      setPendingVerifyPhoneId(null);
      setPendingVerifyPhoneDisplay("");
      setPendingVerifyPhone("");
      setVerifyCode("");
      if (clientIdToRedirect) {
        setInstallSetupClientId(clientIdToRedirect);
      } else {
        router.replace("/app");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingVerifyClientId || !pendingVerifyPhone || resendCooldownSeconds > 0) return;
    setIsResending(true);
    try {
      const res = await fetch("/api/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: pendingVerifyClientId,
          phone: pendingVerifyPhone,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send verification code");
      }
      toast.success("Verification code sent again.");
      setResendCooldownSeconds(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  const handlePhoneVerified = async () => {
    setLoading("complete");
    try {
      toast.success("Phone verified! Next, complete the install setup.");
      setInstallSetupClientId(phoneVerificationClientId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const showRegisterSiteStep =
    statusLoaded &&
    (successParam === "1" || status?.needsSiteRegistration === true) &&
    !phoneStepClientId;

  const phoneVerificationClientId =
    phoneStepClientId ?? status?.firstClientId ?? null;
  const showPhoneVerificationStep =
    statusLoaded &&
    (phoneStepClientId !== null || status?.needsPhoneVerification === true) &&
    phoneVerificationClientId !== null &&
    !installSetupClientId;

  const showInstallSetupStep = statusLoaded && installSetupClientId !== null;

  // When on install setup step, fetch client domain for the form
  useEffect(() => {
    if (!installSetupClientId) return;
    setInstallSetupLoading(true);
    fetch("/api/client")
      .then((r) => r.json())
      .then((clients: Array<{ id: string; domain: string }>) => {
        const client = Array.isArray(clients) ? clients.find((c) => c.id === installSetupClientId) : null;
        if (client?.domain) {
          const url = client.domain.startsWith("http") ? client.domain : `https://${client.domain}`;
          setInstallSetupWebsiteUrl(url);
        } else {
          setInstallSetupWebsiteUrl("https://example.com");
        }
      })
      .catch(() => setInstallSetupWebsiteUrl("https://example.com"))
      .finally(() => setInstallSetupLoading(false));
  }, [installSetupClientId]);

  if (!statusLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (showInstallSetupStep && installSetupClientId) {
    if (installSetupLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
    return (
      <OnboardingInstallSetupForm
        clientId={installSetupClientId}
        initialWebsiteUrl={installSetupWebsiteUrl}
        onSuccess={async () => {
          const cid = installSetupClientId;
          try {
            await fetch("/api/onboarding/complete", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({}),
            });
          } catch {
            // Continue to redirect; status will reflect completion after install job update
          }
          setInstallSetupClientId(null);
          router.replace(`/app/sites?installChoice=1&clientId=${cid}`);
        }}
      />
    );
  }

  if (showPhoneVerificationStep && phoneVerificationClientId) {
    return (
      <div className="min-h-screen bg-muted/30 py-12 px-4 flex flex-col items-center">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Verify Phone Number
            </h1>
            <p className="mt-2 text-muted-foreground">
              Add and verify a phone number to receive SMS messages for your site.
            </p>
          </div>
        </div>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-amber-600" />
              Phone Numbers
            </CardTitle>
            <CardDescription>
              Add verified phone numbers to receive SMS messages for this site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhoneNumberManagement
              clientId={phoneVerificationClientId}
              onPhoneVerified={handlePhoneVerified}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showRegisterSiteStep) {
    return (
      <div className="min-h-screen bg-muted/30 py-12 px-4 flex flex-col items-center">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Register Your Site
            </h1>
            <p className="mt-2 text-muted-foreground">
              Let&apos;s connect your first website to get started.
            </p>
          </div>
        </div>
        <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-amber-600" />
                Site Details
              </CardTitle>
              <CardDescription>
                Enter your business name and website domain.
                {!isStarterPlan && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Note:</strong> You will need to assign a different keyword for each New
                    Site.
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegisterSite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name</Label>
                  <Input
                    id="name"
                    placeholder="Your Business Name"
                    value={registerForm.name}
                    onChange={(e) =>
                      setRegisterForm((s) => ({ ...s, name: e.target.value }))
                    }
                    disabled={!!loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain (e.g. https://example.com)</Label>
                  <Input
                    id="domain"
                    placeholder="https://example.com"
                    value={registerForm.domain}
                    onChange={(e) =>
                      setRegisterForm((s) => ({ ...s, domain: e.target.value }))
                    }
                    disabled={!!loading}
                  />
                </div>
                {!isStarterPlan && (
                  <div className="space-y-2">
                    <Label htmlFor="keyword">SMS Keyword (e.g. BAKERY)</Label>
                    <Input
                      id="keyword"
                      placeholder="BAKERY"
                      value={registerForm.keyword}
                      onChange={(e) =>
                        setRegisterForm((s) => ({ ...s, keyword: e.target.value.replace(/\s/g, "").toUpperCase() }))
                      }
                      disabled={!!loading}
                      maxLength={50}
                    />
                    <p className="text-xs text-muted-foreground">
                      To post via text, send: <strong>{registerForm.keyword || "KEYWORD"}: your message</strong>
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <PhoneInput
                    international
                    defaultCountry="US"
                    value={registerForm.phone}
                    onChange={(value) =>
                      setRegisterForm((s) => ({ ...s, phone: value || "" }))
                    }
                    placeholder="Enter phone number"
                    className="phone-input"
                    disabled={!!loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll send a verification code to this number after you register.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="ownership"
                    checked={registerForm.websiteOwnership}
                    onCheckedChange={(checked) =>
                      setRegisterForm((s) => ({
                        ...s,
                        websiteOwnership: !!checked,
                      }))
                    }
                    disabled={!!loading}
                  />
                  <Label
                    htmlFor="ownership"
                    className="text-sm font-normal leading-relaxed cursor-pointer"
                  >
                    I acknowledge that I own and/or have rights to this website.
                  </Label>
                </div>
                <Button
                  type="submit"
                  disabled={!!loading}
                  className="w-full !bg-amber-600 hover:!bg-amber-700 !text-white"
                >
                  {loading === "register" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Register Site & Continue"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Dialog
            open={verifyCodeDialogOpen}
            onOpenChange={(open) => {
              setVerifyCodeDialogOpen(open);
              if (!open && pendingVerifyClientId) {
                setPhoneStepClientId(pendingVerifyClientId);
              }
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Verify Phone Number</DialogTitle>
                <DialogDescription>
                  Enter the 6-digit verification code sent to {pendingVerifyPhoneDisplay}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="verify-code">Verification Code</Label>
                  <Input
                    id="verify-code"
                    type="text"
                    placeholder="123456"
                    value={verifyCode}
                    onChange={(e) =>
                      setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
                <div className="text-center">
                  {resendCooldownSeconds > 0 ? (
                    <span className="text-sm text-muted-foreground">
                      Resend code in {resendCooldownSeconds}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isResending}
                      className="text-sm text-primary hover:underline disabled:opacity-50"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                          Sending...
                        </>
                      ) : (
                        "Resend code"
                      )}
                    </button>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setVerifyCodeDialogOpen(false)}
                  disabled={isVerifyingCode}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVerifyCodeSubmit}
                  disabled={isVerifyingCode || verifyCode.replace(/\D/g, "").length !== 6}
                  className="!bg-amber-600 hover:!bg-amber-700"
                >
                  {isVerifyingCode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-2 text-muted-foreground">
            Choose the plan that&apos;s right for you — no hidden fees, no surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {/* Starter Plan – uses STRIPE_STARTER_PRICE_ID */}
          <Card className="flex flex-col border-2 border-amber-600/50 shadow-md min-h-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Zap className="h-5 w-5 text-amber-600" />
                Starter Plan
              </CardTitle>
              <div className="mt-1">
                <span className="text-2xl font-bold text-amber-700">$14.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription className="text-sm">
                Everything you need to get started with one website.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto">
              <ul className="space-y-2">
                {STARTER_PLAN_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-amber-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex-shrink-0 border-t border-amber-600/30 flex flex-col gap-2 pt-4 pb-2 mt-0">
              <Button
                className="w-full min-h-11 font-medium !bg-amber-600 hover:!bg-amber-700 !text-white focus-visible:!ring-amber-500/50"
                onClick={() => handlePaidPlan("starter")}
                disabled={!!loading}
              >
                {loading === "starter" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Get Started"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Growth Plan – uses STRIPE_PRO_PRICE_ID */}
          <Card className="flex flex-col border-2 border-amber-600/50 shadow-md min-h-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Layers className="h-5 w-5 text-amber-600" />
                Growth Plan
              </CardTitle>
              <div className="mt-1">
                <span className="text-2xl font-bold text-amber-700">$29.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription className="text-sm">
                Scale with multiple websites and team seats.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto">
              <ul className="space-y-2">
                {GROWTH_PLAN_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-amber-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex-shrink-0 border-t border-amber-600/30 flex flex-col gap-2 pt-4 pb-2 mt-0">
              <Button
                className="w-full min-h-11 font-medium !bg-amber-600 hover:!bg-amber-700 !text-white focus-visible:!ring-amber-500/50"
                onClick={() => handlePaidPlan("pro")}
                disabled={!!loading}
              >
                {loading === "pro" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Get Started"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Enterprise / Teams */}
          <Card className="flex flex-col border-2 border-border shadow-md min-h-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Rocket className="h-5 w-5 text-amber-600" />
                Enterprise / Teams
              </CardTitle>
              <p className="text-xl font-bold text-amber-700 mt-2">Contact Us</p>
              <CardDescription className="text-sm">
                For large enterprises and teams.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-amber-600" />
                  Contact us at{" "}
                  <a
                    href="mailto:sales@t2ms.biz"
                    className="text-amber-700 hover:underline font-medium"
                  >
                    sales@t2ms.biz
                  </a>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex-shrink-0 border-t border-border flex flex-col gap-2 pt-4 pb-2 mt-0">
              <Button
                className="w-full min-h-11 bg-muted text-muted-foreground hover:bg-muted/80"
                onClick={handleEnterpriseContact}
                disabled={!!loading}
              >
                Contact Sales
              </Button>
            </CardFooter>
          </Card>
        </div>
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
