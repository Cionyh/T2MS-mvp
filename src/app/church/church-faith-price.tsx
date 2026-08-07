"use client";

import { useChurchIntroPrice } from "@/hooks/use-church-intro-price";

/** Faith page price line — amount from Stripe church price ID. */
export function ChurchFaithPrice() {
  const { label } = useChurchIntroPrice();
  return (
    <div className="price">
      {label ?? "…"}
      <small>/month</small>
    </div>
  );
}
