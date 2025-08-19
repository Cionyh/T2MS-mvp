"use client";

import { Check, Zap, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Basic",
    price: "$9",
    description: "Perfect for small sites or personal projects.",
    icon: Zap,
    features: [
      "1 website",
      "Unlimited updates",
      "Instant publishing",
      "Basic support",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    description: "For growing businesses needing more power.",
    icon: Rocket,
    features: [
      "Up to 5 websites",
      "Unlimited updates",
      "Instant publishing",
      "Priority support",
      "Custom branding",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    description: "For large teams & multi-location enterprises.",
    icon: Check,
    features: [
      "Unlimited websites",
      "Unlimited updates",
      "Instant publishing",
      "Dedicated account manager",
      "Custom integrations",
    ],
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="w-full max-w-6xl mx-auto px-4 md:px-8 py-20">
      <div className="text-center mb-12">
        <h2 className="font-extrabold tracking-tight bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent text-3xl sm:text-4xl md:text-5xl font-serif">
          Simple, Transparent Pricing
        </h2>
        <p className="text-lg text-muted-foreground mt-4">
          Choose the plan that’s right for you — no hidden fees, no surprises.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
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
                <span className="text-lg font-normal text-muted-foreground">
                  /mo
                </span>
              </p>

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
                className={cn(
                  "mt-6 w-full",
                  plan.highlight
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                )}
              >
                Get Started
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
