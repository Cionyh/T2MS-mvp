"use client";

import Link from "next/link";
import { useEffect, type ComponentProps } from "react";

export const ONBOARDING_PLAN_STORAGE_KEY = "t2ms_onboarding_plan";

/** Persist church campaign plan for post-signup onboarding checkout. */
export function setChurchOnboardingPlan() {
  try {
    sessionStorage.setItem(ONBOARDING_PLAN_STORAGE_KEY, "church");
  } catch {
    // ignore storage errors (private mode, etc.)
  }
}

type ChurchTrialLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  className?: string;
  children: React.ReactNode;
};

/**
 * Church campaign CTA: signup → onboarding with church plan pre-selected.
 * Uses /signup?plan=church plus sessionStorage so OAuth and multi-tab survive.
 */
export function ChurchTrialLink({
  className,
  children,
  onClick,
  ...rest
}: ChurchTrialLinkProps) {
  return (
    <Link
      href="/signup?plan=church"
      className={className}
      onClick={(e) => {
        setChurchOnboardingPlan();
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}

/**
 * Call from church landing pages so the plan is primed even if the user
 * later uses a generic Sign Up nav link without ?plan=church.
 */
export function ChurchPlanSessionPriming() {
  useEffect(() => {
    setChurchOnboardingPlan();
  }, []);
  return null;
}
