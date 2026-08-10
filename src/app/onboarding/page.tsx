"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
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
import { OnboardingHostedSetupForm } from "@/components/onboarding-hosted-setup-form";
import { SETUP_PATH_HOSTED_ONLY } from "@/lib/setup-path";
import { isChurchPlanEnabled } from "@/lib/church-pricing";
import {
  CHURCH_VERIFICATION_VERIFIED,
} from "@/lib/church-verification";
import {
  CHURCH_PLAN_FEATURES,
  GROWTH_PLAN_FEATURES,
  STARTER_PLAN_FEATURES,
  UNIFIED_PLAN_TAGLINE,
} from "@/lib/plan-features";
import { cn } from "@/lib/utils";
import { preparePlanCheckout } from "@/lib/prepare-plan-checkout";
import { ChurchVerificationDialog } from "@/components/onboarding/church-verification-dialog";
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
import {
  formatCouponPlan,
  getStoredCouponCode,
  storeCouponCode,
} from "@/lib/coupons";
import { useChurchIntroPrice } from "@/hooks/use-church-intro-price";
import { planRequiresSmsKeyword } from "@/lib/plan-keyword";

const ONBOARDING_PLAN_STORAGE_KEY = "t2ms_onboarding_plan";
const CHURCH_ORG_NAME_STORAGE_KEY = "t2ms_church_organization_name";

function readChurchPlanIntent(planParam: string | null): boolean {
  if (planParam === "church") return true;
  try {
    return sessionStorage.getItem(ONBOARDING_PLAN_STORAGE_KEY) === "church";
  } catch {
    return false;
  }
}

function readStoredChurchOrganizationName(): string {
  try {
    return sessionStorage.getItem(CHURCH_ORG_NAME_STORAGE_KEY)?.trim() || "";
  } catch {
    return "";
  }
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successParam = searchParams.get("success");
  const planParam = searchParams.get("plan");
  const [loading, setLoading] = useState<string | null>(null);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [status, setStatus] = useState<{
    completed: boolean;
    planId?: string | null;
    setupPath?: string | null;
    needsPathSelection?: boolean;
    needsSiteRegistration?: boolean;
    needsPhoneVerification?: boolean;
    needsInstallSetup?: boolean;
    needsHostedSetup?: boolean;
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
  const [hostedSetupClientId, setHostedSetupClientId] = useState<string | null>(null);
  const [hostedSetupSiteName, setHostedSetupSiteName] = useState("");
  const [installSetupWebsiteUrl, setInstallSetupWebsiteUrl] = useState<string>("");
  const [installSetupLoading, setInstallSetupLoading] = useState(false);
  const [couponRedeeming, setCouponRedeeming] = useState(false);
  const [couponSummary, setCouponSummary] = useState<{
    code: string;
    planLabel: string;
    durationInMonths: number;
  } | null>(null);
  const [churchVerifyDialogOpen, setChurchVerifyDialogOpen] = useState(false);
  const [pendingChurchCheckout, setPendingChurchCheckout] = useState(false);
  // Sticky church funnel intent for the whole onboarding session (URL or sessionStorage)
  const [churchFunnelIntent] = useState(() => readChurchPlanIntent(planParam));
  const churchIntroPrice = useChurchIntroPrice();

  const PENDING_VERIFY_STORAGE_KEY = "t2ms_onboarding_verify_pending";
  const RESEND_COOLDOWN_SECONDS = 60;
  const churchPlanAutoStarted = useRef(false);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding/status");
      const data = await res.json();
      if (data.completed) {
        router.replace("/app");
        return;
      }
      setStatus(data);
      setStatusLoaded(true);
      if (data.needsInstallSetup && data.firstClientId && !installSetupClientId) {
        setInstallSetupClientId(data.firstClientId);
      }
      if (data.needsHostedSetup && data.firstClientId && !hostedSetupClientId) {
        setHostedSetupClientId(data.firstClientId);
      }
    } catch {
      setStatusLoaded(true);
    }
  }, [installSetupClientId, router]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const redeemCoupon = async () => {
      if (!statusLoaded || !status || couponRedeeming) return;
      if (
        successParam === "1" ||
        status.needsSiteRegistration ||
        status.needsPhoneVerification ||
        status.needsInstallSetup
      ) {
        return;
      }

      const storedCoupon = getStoredCouponCode();
      if (!storedCoupon) return;

      try {
        setCouponRedeeming(true);
        const res = await fetch("/api/coupon-codes/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: storedCoupon }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to redeem coupon");
        }

        setCouponSummary({
          code: data.coupon.code,
          planLabel: data.coupon.planLabel,
          durationInMonths: data.coupon.durationInMonths,
        });
        storeCouponCode(null);
        toast.success("Coupon applied. Payment has been skipped.");
        await refreshStatus();
      } catch (error) {
        storeCouponCode(null);
        toast.error(error instanceof Error ? error.message : "Failed to redeem coupon");
        setStatusLoaded(true);
      } finally {
        setCouponRedeeming(false);
      }
    };

    redeemCoupon();
  }, [couponRedeeming, refreshStatus, status, statusLoaded, successParam]);

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

  const proceedToStripeCheckout = async (planId: "starter" | "pro" | "church") => {
    setLoading(planId);
    try {
      const prepared = await preparePlanCheckout(planId);
      if (!prepared.ok) {
        toast.error(prepared.error || "Failed to save plan.");
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
        cancelUrl:
          planId === "church"
            ? `${window.location.origin}/onboarding?plan=church`
            : `${window.location.origin}/onboarding`,
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

  const handlePaidPlan = async (planId: "starter" | "pro" | "church") => {
    if (planId === "church") {
      setLoading("church");
      try {
        const res = await fetch("/api/onboarding/church-verification");
        const data = await res.json();
        if (data.status === CHURCH_VERIFICATION_VERIFIED) {
          await proceedToStripeCheckout("church");
          return;
        }
        setPendingChurchCheckout(true);
        setChurchVerifyDialogOpen(true);
      } catch {
        toast.error("Unable to check church eligibility.");
      } finally {
        setLoading(null);
      }
      return;
    }

    await proceedToStripeCheckout(planId);
  };

  const handleChurchVerified = async () => {
    if (pendingChurchCheckout) {
      setPendingChurchCheckout(false);
      await proceedToStripeCheckout("church");
    }
  };

  const handleEnterpriseContact = () => {
    window.location.href = "mailto:sales@t2ms.biz";
  };

  const isHostedOnlyPath = status?.setupPath === SETUP_PATH_HOSTED_ONLY;
  const churchPlanEnabled = isChurchPlanEnabled();
  const isChurchFunnel =
    churchFunnelIntent ||
    planParam === "church" ||
    readChurchPlanIntent(planParam) ||
    status?.planId === "church";

  // Keyword only for multi-site plans (pro/growth/enterprise) — not church/starter
  const showSmsKeyword =
    !isChurchFunnel && planRequiresSmsKeyword(status?.planId);

  const registerSiteCopy = isChurchFunnel
    ? {
        title: "Register Your Church",
        subtitle:
          "Tell us about your church so we can set up your announcement page.",
        cardTitle: "Church Details",
        cardDescription:
          "Confirm your church name. Website domain is optional.",
        nameLabel: "Church Name *",
        namePlaceholder: "Grace Community Church",
        keywordPlaceholder: "GRACE",
        domainHelp:
          "Skip this if you only need a hosted announcement page for now.",
        ownership:
          "I confirm I am authorized to register this church on Text2MySite.",
        nameRequired: "Please enter your church name.",
        ownershipRequired:
          "Please confirm you are authorized for this church.",
        registerFailed: "Failed to register church",
      }
    : {
        title: "Register Your Business",
        subtitle:
          "Tell us about your business so we can set up your announcement page.",
        cardTitle: "Business Details",
        cardDescription: showSmsKeyword
          ? "Enter your business name. Website domain and SMS keyword are optional."
          : "Enter your business name. Website domain is optional.",
        nameLabel: "Business Name *",
        namePlaceholder: "Your Business Name",
        keywordPlaceholder: "BAKERY",
        domainHelp:
          "Skip this if you only need a hosted announcement page for now.",
        ownership:
          "I confirm I am authorized to register this business on Text2MySite.",
        nameRequired: "Please enter your business name.",
        ownershipRequired:
          "Please confirm you are authorized for this business.",
        registerFailed: "Failed to register business",
      };

  const handleRegisterSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name.trim()) {
      toast.error(registerSiteCopy.nameRequired);
      return;
    }
    const rawKeyword = showSmsKeyword ? registerForm.keyword.trim() : "";
    if (rawKeyword && !/^[A-Za-z0-9_]{1,50}$/.test(rawKeyword)) {
      toast.error("Keyword must be 1–50 characters, letters, numbers, or underscore only.");
      return;
    }
    if (!registerForm.phone.trim()) {
      toast.error("Please enter a phone number.");
      return;
    }
    if (!registerForm.websiteOwnership) {
      toast.error(registerSiteCopy.ownershipRequired);
      return;
    }
    setLoading("register");
    try {
      const domainTrimmed = registerForm.domain.trim();
      const clientRes = await fetch("/api/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerForm.name.trim(),
          ...(domainTrimmed ? { domain: domainTrimmed } : {}),
          ...(rawKeyword ? { keyword: rawKeyword } : {}),
          phone: registerForm.phone.trim(),
        }),
      });
      const clientData = await clientRes.json();
      if (!clientRes.ok) {
        throw new Error(clientData.error || registerSiteCopy.registerFailed);
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

      sessionStorage.removeItem(PENDING_VERIFY_STORAGE_KEY);
      const clientIdToRedirect = pendingVerifyClientId;
      setVerifyCodeDialogOpen(false);
      setPendingVerifyClientId(null);
      setPendingVerifyPhoneId(null);
      setPendingVerifyPhoneDisplay("");
      setPendingVerifyPhone("");
      setVerifyCode("");
      if (clientIdToRedirect) {
        if (isHostedOnlyPath) {
          toast.success("Phone verified! Set up your hosted page.");
          setHostedSetupClientId(clientIdToRedirect);
        } else {
          toast.success("Phone verified! Next, complete the install setup.");
          setInstallSetupClientId(clientIdToRedirect);
        }
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
      if (isHostedOnlyPath) {
        toast.success("Phone verified! Set up your hosted page.");
        setHostedSetupClientId(phoneVerificationClientId);
      } else {
        toast.success("Phone verified! Next, complete the install setup.");
        setInstallSetupClientId(phoneVerificationClientId);
      }
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
    !installSetupClientId &&
    !hostedSetupClientId;

  const showInstallSetupStep =
    statusLoaded && installSetupClientId !== null && !hostedSetupClientId;

  const showHostedSetupStep = statusLoaded && hostedSetupClientId !== null;

  useEffect(() => {
    // Keep church intent sticky for this session (survives refresh / soft nav)
    if (planParam === "church" || churchFunnelIntent) {
      try {
        sessionStorage.setItem(ONBOARDING_PLAN_STORAGE_KEY, "church");
      } catch {
        // ignore
      }
    }
  }, [planParam, churchFunnelIntent]);

  // Prefill church name from eligibility modal (onboarding.churchOrganizationName)
  useEffect(() => {
    if (!showRegisterSiteStep || !isChurchFunnel) return;

    let cancelled = false;

    const applyName = (name: string) => {
      const trimmed = name.trim();
      if (!trimmed || cancelled) return;
      setRegisterForm((prev) =>
        prev.name.trim() ? prev : { ...prev, name: trimmed }
      );
    };

    const fromSession = readStoredChurchOrganizationName();
    if (fromSession) {
      applyName(fromSession);
    }

    void (async () => {
      try {
        const res = await fetch("/api/onboarding/church-verification");
        if (!res.ok) return;
        const data = await res.json();
        const orgName =
          typeof data.organizationName === "string"
            ? data.organizationName
            : "";
        if (orgName.trim()) {
          try {
            sessionStorage.setItem(
              CHURCH_ORG_NAME_STORAGE_KEY,
              orgName.trim()
            );
          } catch {
            // ignore
          }
          applyName(orgName);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showRegisterSiteStep, isChurchFunnel]);

  useEffect(() => {
    if (!statusLoaded || churchPlanAutoStarted.current) return;

    const targetIsChurch =
      isChurchFunnel || planParam === "church" || readChurchPlanIntent(planParam);
    if (!targetIsChurch) return;

    if (
      showRegisterSiteStep ||
      showPhoneVerificationStep ||
      showInstallSetupStep ||
      showHostedSetupStep ||
      successParam === "1" ||
      couponRedeeming
    ) {
      return;
    }

    churchPlanAutoStarted.current = true;
    void handlePaidPlan("church");
  }, [
    couponRedeeming,
    isChurchFunnel,
    planParam,
    showHostedSetupStep,
    showInstallSetupStep,
    showPhoneVerificationStep,
    showRegisterSiteStep,
    statusLoaded,
    successParam,
  ]);

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

  useEffect(() => {
    if (!hostedSetupClientId) return;
    fetch("/api/client")
      .then((r) => r.json())
      .then((clients: Array<{ id: string; name: string }>) => {
        const c = Array.isArray(clients)
          ? clients.find((x) => x.id === hostedSetupClientId)
          : null;
        setHostedSetupSiteName(c?.name ?? "Your site");
      })
      .catch(() => setHostedSetupSiteName("Your site"));
  }, [hostedSetupClientId]);

  if (!statusLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (couponRedeeming) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Applying coupon and skipping payment...
        </div>
      </div>
    );
  }

  if (showHostedSetupStep && hostedSetupClientId) {
    return (
      <OnboardingHostedSetupForm
        clientId={hostedSetupClientId}
        siteName={hostedSetupSiteName}
        onSuccess={async () => {
          try {
            await fetch("/api/onboarding/complete", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({}),
            });
          } catch {
            // redirect anyway
          }
          setHostedSetupClientId(null);
          router.replace("/app/sites");
        }}
      />
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
              {registerSiteCopy.title}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {registerSiteCopy.subtitle}
            </p>
          </div>
        </div>
        <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-amber-600" />
                {registerSiteCopy.cardTitle}
              </CardTitle>
              <CardDescription>
                {registerSiteCopy.cardDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegisterSite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{registerSiteCopy.nameLabel}</Label>
                  <Input
                    id="name"
                    placeholder={registerSiteCopy.namePlaceholder}
                    value={registerForm.name}
                    onChange={(e) =>
                      setRegisterForm((s) => ({ ...s, name: e.target.value }))
                    }
                    disabled={!!loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">
                    Website Domain{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="domain"
                    placeholder="https://example.com"
                    value={registerForm.domain}
                    onChange={(e) =>
                      setRegisterForm((s) => ({ ...s, domain: e.target.value }))
                    }
                    disabled={!!loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    {registerSiteCopy.domainHelp}
                  </p>
                </div>
                {showSmsKeyword ? (
                  <div className="space-y-2">
                    <Label htmlFor="keyword">
                      SMS Keyword{" "}
                      <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="keyword"
                      placeholder={registerSiteCopy.keywordPlaceholder}
                      value={registerForm.keyword}
                      onChange={(e) =>
                        setRegisterForm((s) => ({
                          ...s,
                          keyword: e.target.value.replace(/\s/g, "").toUpperCase(),
                        }))
                      }
                      disabled={!!loading}
                      maxLength={50}
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional for multi-site routing. To post via text:{" "}
                      <strong>
                        {registerForm.keyword || "KEYWORD"}: your message
                      </strong>
                    </p>
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
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
                    {registerSiteCopy.ownership}
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
                    "Continue"
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
            {isChurchFunnel
              ? "Church Partner Plan"
              : "Simple, Transparent Pricing"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isChurchFunnel
              ? "Continue with introductory church pricing. You’ll confirm eligibility, then start your free trial."
              : `${UNIFIED_PLAN_TAGLINE} Choose the plan that fits your needs — no hidden fees.`}
          </p>
          {couponSummary ? (
            <div className="mx-auto mt-4 max-w-xl rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
              Coupon <span className="font-mono">{couponSummary.code}</span> applied for the{" "}
              {couponSummary.planLabel} plan for {couponSummary.durationInMonths} month(s).
            </div>
          ) : null}
        </div>

        {/* Church funnel from /church or /church-page-announcements — only Church Partner, not business plans */}
        {isChurchFunnel ? (
          <div className="mx-auto max-w-md">
            <Card className="relative flex flex-col border-2 border-amber-600/50 shadow-md overflow-hidden ring-2 ring-amber-600/15">
              <div
                className="pointer-events-none absolute -left-9 top-5 z-10 w-36 rotate-[-45deg] bg-amber-500 py-1 text-center text-[11px] font-bold uppercase tracking-wide text-amber-950 shadow-md"
                aria-hidden
              >
                Church intro
              </div>
              <CardHeader className="pt-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Zap className="h-5 w-5 text-amber-600" />
                  Church Partner
                </CardTitle>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-1">
                  <span className="text-2xl font-bold text-amber-700">
                    {churchIntroPrice.label ?? "…"}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="text-sm">
                  Verified churches &amp; religious organizations — hosted page
                  and widget, 14-day free trial.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {CHURCH_PLAN_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex-shrink-0 border-t border-amber-600/30 flex flex-col gap-2 pt-4 pb-2">
                <Button
                  className="w-full min-h-11 font-medium !bg-amber-600 hover:!bg-amber-700 !text-white"
                  onClick={() => handlePaidPlan("church")}
                  disabled={!!loading}
                >
                  {loading === "church" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Continue with Church Partner trial"
                  )}
                </Button>
                {!churchPlanEnabled && (
                  <p className="text-xs text-muted-foreground text-center">
                    If checkout is unavailable, contact{" "}
                    <a href="mailto:sales@t2ms.biz" className="underline">
                      sales@t2ms.biz
                    </a>
                    .
                  </p>
                )}
              </CardFooter>
            </Card>
          </div>
        ) : (
        <div className="grid gap-6 items-stretch md:grid-cols-3">
          {/* Starter Plan – uses STRIPE_STARTER_PRICE_ID */}
          <Card className="relative flex flex-col border-2 border-amber-600/50 shadow-md min-h-0 overflow-hidden ring-2 ring-amber-600/15">
            <div
              className="pointer-events-none absolute -left-9 top-5 z-10 w-36 rotate-[-45deg] bg-amber-500 py-1 text-center text-[11px] font-bold uppercase tracking-wide text-amber-950 shadow-md"
              aria-hidden
            >
              Special Offer
            </div>
            <CardHeader className="pt-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Zap className="h-5 w-5 text-amber-600" />
                Starter Plan
              </CardTitle>
              <div className="mt-1">
                <span className="text-2xl font-bold text-amber-700">$14.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription className="text-sm">
                One site — hosted page and widget included.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto">
              <ul className="space-y-2">
                {STARTER_PLAN_FEATURES.map((feature) => {
                  const isFeatured =
                    feature === "Hosted announcement page on t2ms.live";
                  return (
                    <li
                      key={feature}
                      className={cn(
                        "flex items-start gap-2 text-sm",
                        isFeatured &&
                          "rounded-md border-y border-amber-400/70 bg-amber-50/80 px-2 py-2 dark:bg-amber-950/30"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isFeatured
                            ? "text-amber-700 dark:text-amber-400 mt-0.5"
                            : "text-amber-600"
                        )}
                      />
                      <span
                        className={cn(isFeatured && "font-semibold text-foreground")}
                      >
                        {feature}
                      </span>
                    </li>
                  );
                })}
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
        )}
        <ChurchVerificationDialog
          open={churchVerifyDialogOpen}
          onOpenChange={setChurchVerifyDialogOpen}
          onVerified={handleChurchVerified}
        />
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
