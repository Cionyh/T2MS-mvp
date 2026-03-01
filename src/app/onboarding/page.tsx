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

const EARLY_BIRD_FEATURES = [
  "1 User / Seat",
  "1 Website",
  "100 messages per month",
  "Priority support",
  "Widget customization tools",
  "14-day free trial",
];

const STANDARD_FEATURES = [
  "1 to 3 Users / Seats",
  "Up to 3 Websites",
  "220 messages per month",
  "Priority support",
  "Widget customization tools",
  "14-day free trial",
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
    firstClientId?: string | null;
  } | null>(null);
  const [phoneStepClientId, setPhoneStepClientId] = useState<string | null>(null);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    domain: "",
    phone: "",
    websiteOwnership: false,
  });
  const [verifyCodeDialogOpen, setVerifyCodeDialogOpen] = useState(false);
  const [pendingVerifyClientId, setPendingVerifyClientId] = useState<string | null>(null);
  const [pendingVerifyPhoneId, setPendingVerifyPhoneId] = useState<string | null>(null);
  const [pendingVerifyPhoneDisplay, setPendingVerifyPhoneDisplay] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

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
      } catch {
        setStatusLoaded(true);
      }
    };
    fetchStatus();
  }, [router]);

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

  const handleRegisterSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name.trim() || !registerForm.domain.trim()) {
      toast.error("Please enter a business name and domain.");
      return;
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
      setPendingVerifyClientId(clientId);
      setPendingVerifyPhoneId(phoneRecord.id);
      setPendingVerifyPhoneDisplay(phoneRecord.phone);
      setVerifyCode("");
      setVerifyCodeDialogOpen(true);
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

      const completeRes = await fetch("/api/onboarding/complete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!completeRes.ok) {
        const completeData = await completeRes.json();
        throw new Error(completeData.error || "Failed to complete onboarding");
      }

      toast.success("Phone verified! Welcome to T2MS.");
      const clientIdToRedirect = pendingVerifyClientId;
      setVerifyCodeDialogOpen(false);
      setPendingVerifyClientId(null);
      setPendingVerifyPhoneId(null);
      setPendingVerifyPhoneDisplay("");
      setVerifyCode("");
      if (clientIdToRedirect) {
        router.replace(`/app/sites?installChoice=1&clientId=${clientIdToRedirect}`);
      } else {
        router.replace("/app");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handlePhoneVerified = async () => {
    setLoading("complete");
    try {
      const completeRes = await fetch("/api/onboarding/complete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const completeData = await completeRes.json();
      if (!completeRes.ok) {
        throw new Error(completeData.error || "Failed to complete onboarding");
      }
      toast.success("Phone verified! Welcome to T2MS.");
      router.replace(`/app/sites?installChoice=1&clientId=${phoneVerificationClientId}`);
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
    phoneVerificationClientId !== null;

  if (!statusLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
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
              Add your website to get started. You won&apos;t be able to access the dashboard until you register at least one site.
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
            <DialogContent>
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
          {/* Limited Offer Early Bird Special */}
          <Card className="flex flex-col border-2 border-amber-600/50 shadow-md min-h-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Zap className="h-5 w-5 text-amber-600" />
                Limited Offer Early Bird Special
              </CardTitle>
              <div className="mt-1">
                <span className="text-2xl font-bold text-amber-700">$9.99</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <CardDescription className="text-sm">
                Ideal for busy entrepreneurs or personal projects.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto">
              <ul className="space-y-2">
                {EARLY_BIRD_FEATURES.map((feature) => (
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

          {/* Limited Offer Standard Price */}
          <Card className="flex flex-col border-2 border-amber-600/50 shadow-md min-h-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Layers className="h-5 w-5 text-amber-600" />
                Limited Offer Standard Price
              </CardTitle>
              <div className="mt-1">
                <span className="text-2xl font-bold text-amber-700">$19.95</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <CardDescription className="text-sm">
                Perfect for small sites or personal projects.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto">
              <ul className="space-y-2">
                {STANDARD_FEATURES.map((feature) => (
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
