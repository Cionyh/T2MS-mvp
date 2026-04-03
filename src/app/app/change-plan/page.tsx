"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { client } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, CreditCard, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PLAN_OPTIONS = [
  { id: "starter", name: "Limited Offer Early Bird Special", price: "$14.99/mo", description: "1 website, 100 messages/month, 14-day free trial" },
  { id: "pro", name: "Limited Offer Standard Price", price: "$29.99/mo", description: "Up to 3 websites, 330 messages/month, 14-day free trial" },
];

interface Subscription {
  id: string;
  plan: string;
  status: string;
}

export default function ChangePlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string>("free");
  const [onboardingPlanId, setOnboardingPlanId] = useState<string | null>(null);
  const [installAddonSku, setInstallAddonSku] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("free");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await client.getSession();
        if (!session?.data?.user?.id) {
          router.replace("/sign-in");
          return;
        }

        const [subsRes, onboardingRes] = await Promise.all([
          client.subscription.list({ query: { referenceId: session.data.user.id } }),
          fetch("/api/onboarding"),
        ]);

        const subsData = (subsRes as { data?: Subscription[] }).data;
        const activeSubscription = (Array.isArray(subsData) ? subsData : []).find(
          (s) => s.status === "active" || s.status === "trialing"
        );
        const planFromSub = activeSubscription?.plan ?? null;

        let planFromOnboarding: string | null = null;
        let addon: string | null = null;
        if (onboardingRes.ok) {
          const ob = await onboardingRes.json();
          if (ob.onboarding) {
            planFromOnboarding = ob.onboarding.planId ?? null;
            addon = ob.onboarding.installAddonSku ?? null;
          }
        }

        setOnboardingPlanId(planFromOnboarding ?? null);
        setInstallAddonSku(addon);
        const current = planFromSub || planFromOnboarding || "free";
        setCurrentPlanId(current);
        setSelectedPlanId(current === "free" || current === "enterprise" ? "starter" : current);
      } catch {
        toast.error("Failed to load plan info");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleSwitchPlan = async () => {
    if (selectedPlanId === currentPlanId) {
      toast.info("You're already on this plan.");
      return;
    }

    setActionLoading(true);
    try {
      const session = await client.getSession();
      if (!session?.data?.user?.id) {
        toast.error("Please sign in to continue.");
        setActionLoading(false);
        return;
      }

      const { data, error } = await client.subscription.upgrade({
        plan: selectedPlanId,
        referenceId: session.data.user.id,
        successUrl: `${window.location.origin}/app/settings?tab=setup`,
        cancelUrl: `${window.location.origin}/app/change-plan`,
      });

      if (error) {
        toast.error(error.message || "Failed to start checkout");
        setActionLoading(false);
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentPlan =
    PLAN_OPTIONS.find((p) => p.id === currentPlanId) ??
    (currentPlanId === "enterprise"
      ? { id: "enterprise", name: "Enterprise / Teams", price: "Contact us", description: "For large enterprises and teams" }
      : currentPlanId === "free"
      ? { id: "free", name: "Free", price: "$0", description: "Get started with limited features" }
      : PLAN_OPTIONS[0]);

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Change plan
          </CardTitle>
          <CardDescription>
            Your current plan and available plans. Select a plan and switch.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Current plan</p>
            <p className="text-lg font-semibold">{currentPlan.name}</p>
            <p className="text-sm text-muted-foreground">{currentPlan.price} · {currentPlan.description}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Available plans</p>
            <div className="grid gap-3">
              {PLAN_OPTIONS.map((plan) => (
                <label
                  key={plan.id}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                    selectedPlanId === plan.id
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:bg-muted/50"
                  )}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan.id}
                    checked={selectedPlanId === plan.id}
                    onChange={() => setSelectedPlanId(plan.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <p className="text-sm font-medium mt-1">{plan.price}</p>
                  </div>
                  {plan.id === currentPlanId && (
                    <span className="text-xs font-medium text-primary flex items-center gap-1">
                      <Check className="h-4 w-4" /> Current
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSwitchPlan}
              disabled={actionLoading || selectedPlanId === currentPlanId}
              className="flex-1"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : selectedPlanId === currentPlanId ? (
                "Current plan"
              ) : (
                "Switch plan"
              )}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/app/settings?tab=setup">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
