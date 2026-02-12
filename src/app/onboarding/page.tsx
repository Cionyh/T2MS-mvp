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
import { client } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, Zap, Layers, Rocket, Check } from "lucide-react";

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

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/onboarding/status");
        const data = await res.json();
        if (data.completed) {
          router.replace("/app");
          return;
        }
        setStatusLoaded(true);
      } catch {
        setStatusLoaded(true);
      }
    };
    fetchStatus();
  }, [router]);

  // Return from Stripe subscription success: complete onboarding and redirect to app
  useEffect(() => {
    if (successParam !== "1" || !statusLoaded) return;
    setLoading("complete");
    fetch("/api/onboarding/complete", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          toast.success("Onboarding complete!");
          router.replace("/app");
        } else {
          setLoading(null);
        }
      })
      .catch(() => setLoading(null));
  }, [successParam, statusLoaded, router]);

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

  if (!statusLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (successParam === "1") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Completing your setup…</p>
        </div>
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
