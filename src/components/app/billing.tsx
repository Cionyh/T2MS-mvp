"use client";

import { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      // Get the current session to get the user ID
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
  const currentPlan = activeSubscription?.plan || "free";
  const limits = planLimits[currentPlan] || { websites: 1, messages: 10, storage: 0.1 };

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
                ) : (
                  "Free Plan"
                )}
              </p>
            </div>
            <Badge className={getStatusColor(activeSubscription?.status || "free")}>
              {activeSubscription?.status || "free"}
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

              {/* Upgrade Button - only show for non-enterprise plans */}
              {activeSubscription.plan !== "enterprise" && (
                <Button
                  onClick={() => window.location.href = "/#pricing"}
                  variant="default"
                >
                  Upgrade Plan
                </Button>
              )}

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

      {/* Upgrade Options */}
      {!activeSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Unlock more features and higher limits with a paid subscription.
            </p>
            <Button onClick={() => window.location.href = "/#pricing"}>
              View Plans
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
