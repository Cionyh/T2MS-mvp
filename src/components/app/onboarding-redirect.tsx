"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

/**
 * Component that checks onboarding status and redirects if needed
 * Use this in pages where onboarding should be completed first
 */
export function OnboardingRedirect() {
  const { data: session } = useSession();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkOnboarding() {
      if (!session?.user?.id) {
        setChecking(false);
        return;
      }

      try {
        const response = await fetch("/api/onboarding");
        if (!response.ok) {
          setChecking(false);
          return;
        }

        const data = await response.json();
        
        // If onboarding is not completed, redirect to onboarding page
        if (!data.onboardingCompleted) {
          router.push("/app/onboarding");
          return;
        }

        setChecking(false);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setChecking(false);
      }
    }

    checkOnboarding();
  }, [session, router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return null;
}
