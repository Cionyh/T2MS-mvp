"use client";

import { Check, ExternalLink, Zap, Layers, Rocket, Church } from "lucide-react";
import {
  CHURCH_PLAN_FEATURES,
  getChurchIntroPriceLabel,
  isChurchPlanEnabled,
} from "@/lib/church-pricing";
import {
  GROWTH_PLAN_FEATURES,
  STARTER_PLAN_FEATURES,
  UNIFIED_PLAN_TAGLINE,
} from "@/lib/plan-features";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";

type PricingPlan = {
  name: string;
  planId: string;
  price: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  highlight: boolean;
  offerBadge?: string;
  highlightedFeature?: string;
  powerfulFeatures?: {
    title: string;
    subtitle: string;
    previewUrl: string;
  };
};

const plans: PricingPlan[] = [
  {
    name: "Starter Plan",
    planId: "starter",
    price: "$14.99",
    description: "One site — hosted page and widget on the same subscription.",
    icon: Zap,
    features: [...STARTER_PLAN_FEATURES],
    highlight: true,
    offerBadge: "Special Offer",
    highlightedFeature: "Hosted announcement page on t2ms.live",
  },
  {
    name: "Growth Plan",
    planId: "pro",
    price: "$29.99",
    description: "Scale with multiple sites — hosted page and widget on each.",
    icon: Layers,
    features: [...GROWTH_PLAN_FEATURES],
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
    powerfulFeatures: {
      title: "Powerful Features",
      subtitle: "Instant updates for you & your team",
      previewUrl: "https://t2ms.site/features1.html",
    },
  },
];

function FeaturesPreviewDialog({ url }: { url: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
        >
          View features
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton
        className="max-w-5xl w-[min(100vw-2rem,56rem)] h-[min(85vh,820px)] gap-0 p-0 sm:max-w-5xl flex flex-col overflow-hidden"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Powerful Features</DialogTitle>
        </DialogHeader>
        <iframe
          title="Powerful Features"
          src={url}
          className="h-full min-h-[50vh] w-full flex-1 border-0 bg-background"
        />
      </DialogContent>
    </Dialog>
  );
}

function buildPricingPlans(): PricingPlan[] {
  const churchPlan: PricingPlan | null = isChurchPlanEnabled()
    ? {
        name: "Church Intro Plan",
        planId: "church",
        price: getChurchIntroPriceLabel(),
        description: "Verified churches — intro pricing, price locked up to 3 years.",
        icon: Church,
        features: [...CHURCH_PLAN_FEATURES],
        highlight: true,
      }
    : null;

  return churchPlan ? [churchPlan, ...plans] : plans;
}

export function PricingSection() {
  const displayPlans = buildPricingPlans();

  return (
    <section id="pricing" className="w-full max-w-6xl mx-auto px-4 md:px-8 py-20">
      <div className="text-center mb-12">
        <h2 className="font-extrabold tracking-tight bg-gradient-to-b from-foreground via-foreground to-background bg-clip-text text-transparent text-3xl sm:text-4xl md:text-5xl font-serif">
          Simple, Transparent Pricing
        </h2>
        <p className="text-lg text-muted-foreground mt-4">
          {UNIFIED_PLAN_TAGLINE} No hidden fees, no surprises.
        </p>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-8",
          displayPlans.length >= 4
            ? "md:grid-cols-2 lg:grid-cols-4"
            : "md:grid-cols-3"
        )}
      >
        {displayPlans.map((plan) => {
          const Icon = plan.icon;
          const isEnterprise = plan.planId === "enterprise";
          return (
            <div
              key={plan.name}
              className={cn(
                "relative overflow-hidden border border-muted-foreground/20 rounded-2xl p-6 flex flex-col",
                "transition-transform hover:scale-[1.02]",
                plan.highlight && "border-primary",
                plan.offerBadge && "ring-2 ring-primary/20"
              )}
            >
              {plan.offerBadge ? (
                <div
                  className="pointer-events-none absolute -left-9 top-5 z-10 w-36 rotate-[-45deg] bg-amber-500 py-1 text-center text-[11px] font-bold uppercase tracking-wide text-amber-950 shadow-md"
                  aria-hidden
                >
                  {plan.offerBadge}
                </div>
              ) : null}

              <div className={cn("flex items-center gap-3 mb-4", plan.offerBadge && "pt-2")}>
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
                {plan.features.map((feature) => {
                  const isFeatured = plan.highlightedFeature === feature;
                  return (
                    <li
                      key={feature}
                      className={cn(
                        "flex items-start gap-2",
                        isFeatured &&
                          "relative rounded-md border-y border-amber-400/70 bg-amber-50/80 px-2 py-2 dark:bg-amber-950/30"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isFeatured ? "text-amber-600 dark:text-amber-400" : "text-primary"
                        )}
                      />
                      <span
                        className={cn(
                          isFeatured && "font-semibold text-foreground"
                        )}
                      >
                        {feature}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {plan.powerfulFeatures ? (
                <div className="mt-5 pt-5 border-t border-muted-foreground/20 space-y-2">
                  <h4 className="text-base font-semibold text-foreground">
                    {plan.powerfulFeatures.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-snug">
                    {plan.powerfulFeatures.subtitle}
                  </p>
                  <div className="pt-1 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                    <FeaturesPreviewDialog url={plan.powerfulFeatures.previewUrl} />
                    <a
                      href={plan.powerfulFeatures.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                    >
                      Open in new tab
                    </a>
                  </div>
                </div>
              ) : null}

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
