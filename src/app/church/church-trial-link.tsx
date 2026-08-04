"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

const ONBOARDING_PLAN_STORAGE_KEY = "t2ms_onboarding_plan";

type ChurchTrialLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  className?: string;
  children: React.ReactNode;
};

/**
 * Church campaign CTA: send new customers through signup, then onboarding
 * with the church plan pre-selected (via sessionStorage / post-signup flow).
 */
export function ChurchTrialLink({ className, children, onClick, ...rest }: ChurchTrialLinkProps) {
  return (
    <Link
      href="/signup"
      className={className}
      onClick={(e) => {
        try {
          sessionStorage.setItem(ONBOARDING_PLAN_STORAGE_KEY, "church");
        } catch {
          // ignore storage errors
        }
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
