"use client";

import { Check, Zap, Layers, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const plans = [
  {
    name: "Starter Plan",
    planId: "starter",
    price: "$14.99",
    description: "Everything you need to get started with one website.",
    icon: Zap,
    features: [
      "1 Website",
      "100 Messages per Month",
      "Professional Widget Installation (Included)",
      "Priority Support",
      "14-Day Free Trial",
    ],
    highlight: true,
  },
  {
    name: "Growth Plan",
    planId: "pro",
    price: "$29.99",
    description: "Scale with multiple websites and team seats.",
    icon: Layers,
    features: [
      "Up to 3 Websites",
      "1–3 Users / Seats",
      "330 Messages per Month",
      "Professional Widget Installation (Included)",
      "Priority Support",
      "14-Day Free Trial",
    ],
    highlight: true,
  },
  {
    name: "Enterprise / Teams",
    planId: "enterprise",
    price: "Contact Us",
    description: "For large enterprises and teams.",
    icon: Rocket,
    features: ["Contact us at sales@t2ms.biz"],
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
        Choose the plan that's right for you -- no hidden fees, no surprises.        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isEnterprise = plan.planId === "enterprise";
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
                {!isEnterprise && (
                  <span className="text-lg font-normal text-muted-foreground">
                    /mo
                  </span>
                )}
              </p>

              <p className="text-muted-foreground mt-2 mb-6">
                {plan.description}
              </p>

              <ul className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isEnterprise ? (
                <Button
                  asChild
                  className={cn(
                    "mt-6 w-full",
                    "bg-muted text-foreground hover:bg-muted/80"
                  )}
                >
                  <a href="mailto:sales@t2ms.biz">Contact Sales</a>
                </Button>
              ) : (
                <Button
                  asChild
                  className={cn(
                    "mt-6 w-full",
                    "bg-primary text-white hover:bg-primary/90"
                  )}
                >
                  <Link href="/sign-in">Get Started</Link>
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
