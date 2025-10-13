"use client";

import { Check, Zap, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { client } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState } from "react";

const plans = [
  {
    name: "Introductory Offer",
    planId: "starter",
    price: "$9.99",
    priceAnnual: "$119",
    description: "Perfect for small sites or personal projects.",
    icon: Zap,
    features: [
      "Up to 3 websites",
      "100 messages per month",
      "Basic support",
      "Widget customization",
      "14-day free trial",
    ],
    highlight: true,
  },
  {
    name: "Enterprise / Teams",
    planId: "enterprise",
    price: "Contact Us",
    description: "For large enterprises and teams.",
    icon: Rocket,
    features: [
      "Contact us at sales@t2ms.biz",
    ],
    highlight: false,
  },
];

export function PricingSection() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    try {
      // Get the current session to get the user ID
      const session = await client.getSession();
      if (!session?.data?.user?.id) {
        toast.error("Please sign in to upgrade your plan");
        return;
      }

      // Handle free plan - no subscription needed
      if (planId === "free") {
        toast.success("You're already on the free plan! Start creating your first site.");
        window.location.href = "/app/sites";
        return;
      }

      const { data, error } = await client.subscription.upgrade({
        plan: planId,
        referenceId: session.data.user.id,
        successUrl: `${window.location.origin}/app/sites?upgraded=true`,
        cancelUrl: `${window.location.origin}/#pricing`,
      });

      if (error) {
        toast.error(error.message || "Failed to start subscription");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="w-full max-w-6xl mx-auto px-4 md:px-8 py-20">
      <div className="text-center mb-12">
        <h2 className="font-extrabold tracking-tight bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent text-3xl sm:text-4xl md:text-5xl font-serif">
          Simple, Transparent Pricing
        </h2>
        <p className="text-lg text-muted-foreground mt-4">
        Choose the plan that's right for you -- no hidden fees, no surprises.        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isLoading = loading === plan.planId;
          return (
            <div
              key={plan.name}
              className={cn(
                "border border-muted-foreground/20 rounded-2xl p-6 flex flex-col",
                "transition-transform hover:scale-[1.02]",
                plan.highlight && "border-primary"
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold">{plan.name}</h3>
              </div>

              <p className="text-4xl font-extrabold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                {plan.price}
                {plan.price !== "Contact Us" && (
                  <span className="text-lg font-normal text-muted-foreground">
                    /mo
                  </span>
                )}
              </p>
              
              {plan.priceAnnual && (
                <p className="text-lg text-muted-foreground">
                  or {plan.priceAnnual} annually
                </p>
              )}

              <p className="text-muted-foreground mt-2 mb-6">
                {plan.description}
              </p>

              <ul className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => {
                  if (plan.planId === "enterprise") {
                    window.location.href = "mailto:sales@t2ms.biz";
                  } else {
                    handleUpgrade(plan.planId);
                  }
                }}
                disabled={isLoading}
                className={cn(
                  "mt-6 w-full",
                  plan.highlight
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                )}
              >
                {isLoading ? "Processing..." : plan.planId === "enterprise" ? "Contact Sales" : "Get Started"}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
