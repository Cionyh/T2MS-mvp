"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /app/onboarding was the old "Get Widget Installed" flow.
 * It is now a dedicated "New widget install job" flow at /app/install-request (with payment).
 * Redirect so existing links and bookmarks still work.
 */
export default function AppOnboardingPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/app/install-request");
  }, [router]);
  return null;
}
