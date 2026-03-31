"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { normalizeReferralCode, storeReferralCode } from "@/lib/referral";

export function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = normalizeReferralCode(searchParams.get("ref"));
    if (code) {
      storeReferralCode(code);
    }
  }, [searchParams]);

  return null;
}
