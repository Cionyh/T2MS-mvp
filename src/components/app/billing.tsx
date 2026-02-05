"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { client } from "@/lib/auth-client";
import { toast } from "sonner";
import { CreditCard, Calendar, Users, Globe, MessageSquare, HardDrive } from "lucide-react";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  periodStart?: Date | string;
  periodEnd?: Date | string;
  cancelAtPeriodEnd?: boolean;
  seats?: number;
  trialStart?: Date | string;
  trialEnd?: Date | string;
  limits?: Record<string, number>;
  priceId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

interface PlanLimits {
  websites: number;
  messages: number;
  storage: number;
}

const planLimits: Record<string, PlanLimits> = {
  free: { websites: 10, messages: 1000, storage: 10 },
  starter: { websites: 50, messages: 10000, storage: 50 },
  pro: { websites: 200, messages: 50000, storage: 200 },
  enterprise: { websites: -1, messages: -1, storage: 1000 }
};

export function BillingSection() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [onboardingPlanId, setOnboardingPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const syncAttempted = useRef(false);

  useEffect(() => {
    fetchSubscriptions();
    fetchOnboardingPlan();
  }, []);

  // When payment pending, try syncing from Stripe once (webhook may have succeeded but DB wasn't updated)
  useEffect(() => {
    if (loading || !onboardingPlanId || onboardingPlanId === "free") return;
    const hasActive = subscriptions.some(
      (s) => s.status === "active" || s.status === "trialing"
    );
    if (hasActive || syncAttempted.current) return;

    syncAttempted.current = true;
    const sync = async () => {
      try {
        const res = await fetch("/api/subscription/sync", { method: "POST" });
        const data = await res.json();
        if (res.ok && data.synced > 0) {
          await fetchSubscriptions();
          toast.success("Subscription synced successfully");
        }
      } catch {
        // Ignore
      }
    };
    sync();
  }, [loading, onboardingPlanId, subscriptions.length]);

  const fetchSubscriptions = async () => {
    try {
      const session = await client.getSession();
      if (!session?.data?.user?.id) {
        toast.error("Please sign in to view subscriptions");
        return;
      }

      const { data, error } = await client.subscription.list({
        query: {
          referenceId: session.data.user.id
        }
      });

      if (error) {
        toast.error(error.message || "Failed to fetch subscriptions");
        return;
      }

      setSubscriptions((data as Subscription[]) || []);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchOnboardingPlan = async () => {
    try {
      const res = await fetch("/api/onboarding/status");
      if (!res.ok) return;
      const data = await res.json();
      if (data.planId && data.planId !== "free") {
        setOnboardingPlanId(data.planId);
      }
    } catch {
      // Ignore
    }
  };

  const syncSubscriptionFromStripe = async () => {
    setActionLoading("sync");
    try {
      const res = await fetch("/api/subscription/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.synced > 0) {
        await fetchSubscriptions();
        toast.success("Subscription synced successfully");
      } else if (res.ok) {
        toast.info("No subscription found to sync");
      } else {
        toast.error(data.error || "Sync failed");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    setActionLoading(subscriptionId);
    try {
      const session = await client.getSession();
      if (!session?.data?.user?.id) {
        toast.error("Please sign in to manage subscriptions");
        return;
      }

      const { data, error } = await client.subscription.cancel({
        referenceId: session.data.user.id,
        subscriptionId,
        returnUrl: window.location.href
      });

      if (error) {
        toast.error(error.message || "Failed to cancel subscription");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreSubscription = async (subscriptionId: string) => {
    setActionLoading(subscriptionId);
    try {
      const session = await client.getSession();
      if (!session?.data?.user?.id) {
        toast.error("Please sign in to manage subscriptions");
        return;
      }

      const { data, error } = await client.subscription.restore({
        referenceId: session.data.user.id,
        subscriptionId
      });

      if (error) {
        toast.error(error.message || "Failed to restore subscription");
        return;
      }

      toast.success("Subscription restored successfully!");
      fetchSubscriptions();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBillingPortal = async () => {
    setActionLoading("billing-portal");
    try {
      const session = await client.getSession();
      if (!session?.data?.user?.id) {
        toast.error("Please sign in to manage billing");
        return;
      }

      const { data, error } = await client.subscription.billingPortal({
        referenceId: session.data.user.id,
        returnUrl: window.location.href
      });

      if (error) {
        toast.error(error.message || "Failed to open billing portal");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompletePayment = async () => {
    if (!onboardingPlanId || onboardingPlanId === "free") return;
    setActionLoading("complete-payment");
    try {
      const session = await client.getSession();
      if (!session?.data?.user?.id) {
        toast.error("Please sign in to continue");
        setActionLoading(null);
        return;
      }
      const { data, error } = await client.subscription.upgrade({
        plan: onboardingPlanId,
        referenceId: session.data.user.id,
        successUrl: `${window.location.origin}/app/billing?upgraded=true`,
        cancelUrl: `${window.location.origin}/app/billing`,
      });
      if (error) {
        toast.error(error.message || "Failed to start checkout");
        setActionLoading(null);
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "trialing":
        return "bg-blue-500";
      case "canceled":
        return "bg-red-500";
      case "past_due":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const activeSubscription = subscriptions.find(sub => sub.status === "active" || sub.status === "trialing");
  // Use onboarding plan as fallback when user chose a paid plan during onboarding but subscription isn't synced yet
  const currentPlan = activeSubscription?.plan || onboardingPlanId || "free";
  const limits = planLimits[currentPlan] || { websites: 1, messages: 10, storage: 0.1 };
  const paymentPending = !activeSubscription && onboardingPlanId && onboardingPlanId !== "free";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Billing & Subscription</h2>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold capitalize">{currentPlan}</h3>
              <p className="text-muted-foreground">
                {activeSubscription ? (
                  <>
                    {activeSubscription.status === "trialing" ? "Free Trial" : "Active Subscription"}
                    {activeSubscription.trialEnd && (
                      <span className="ml-2 text-sm">
                        (Trial ends {formatDate(activeSubscription.trialEnd)})
                      </span>
                    )}
                  </>
                ) : paymentPending ? (
                  "Selected during onboarding — complete payment to activate"
                ) : (
                  "Free Plan"
                )}
              </p>
            </div>
            <Badge className={getStatusColor(activeSubscription?.status || (paymentPending ? "past_due" : "free"))}>
              {activeSubscription?.status || (paymentPending ? "Payment pending" : "free")}
            </Badge>
          </div>

          {activeSubscription && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Billing Period:</span>
                <p>{formatDate(activeSubscription.periodStart)} - {formatDate(activeSubscription.periodEnd)}</p>
              </div>
              {activeSubscription.cancelAtPeriodEnd && (
                <div>
                  <span className="text-muted-foreground">Cancellation:</span>
                  <p className="text-yellow-600">Will cancel at period end</p>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Plan Limits */}
          <div>
            <h4 className="font-medium mb-3">Plan Limits</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Websites: {limits.websites === -1 ? "Unlimited" : limits.websites}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Messages: {limits.messages === -1 ? "Unlimited" : `${limits.messages}/month`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Storage: {limits.storage}GB
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Management */}
      {activeSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
             <Button
                onClick={handleBillingPortal}
                disabled={actionLoading === "billing-portal"}
                variant="outline"
              >
                {actionLoading === "billing-portal" ? "Loading..." : "Manage Billing"}
              </Button>

              {activeSubscription.cancelAtPeriodEnd ? (
                <Button
                  onClick={() => handleRestoreSubscription(activeSubscription.id)}
                  disabled={actionLoading === activeSubscription.id}
                  variant="outline"
                >
                  {actionLoading === activeSubscription.id ? "Processing..." : "Restore Subscription"}
                </Button>
              ) : (
                <Button
                  onClick={() => handleCancelSubscription(activeSubscription.id)}
                  disabled={actionLoading === activeSubscription.id}
                  variant="destructive"
                >
                  {actionLoading === activeSubscription.id ? "Processing..." : "Cancel Subscription"}
                </Button>
              )}
            </div>

            {activeSubscription.cancelAtPeriodEnd && (
              <p className="text-sm text-muted-foreground">
                Your subscription will remain active until {formatDate(activeSubscription.periodEnd)}. 
                You can restore it anytime before then.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment pending: user chose paid plan during onboarding but subscription not synced */}
      {paymentPending && (
        <Card>
          <CardHeader>
            <CardTitle>Complete your subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You selected the <strong className="capitalize">{onboardingPlanId}</strong> plan during onboarding.
              Complete payment to activate your subscription and unlock plan limits.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleCompletePayment}
                disabled={actionLoading === "complete-payment"}
              >
                {actionLoading === "complete-payment" ? "Loading..." : "Complete payment"}
              </Button>
              <Button
                variant="outline"
                onClick={syncSubscriptionFromStripe}
                disabled={actionLoading === "sync"}
              >
                {actionLoading === "sync" ? "Syncing..." : "Refresh status"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Options */}
      {!activeSubscription && !paymentPending && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Unlock more features and higher limits with a paid subscription.
            </p>
            <Button onClick={() => window.location.href = "/pricing"}>
              View Plans
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
