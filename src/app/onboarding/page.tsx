"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { client } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successParam = searchParams.get("success");
  const [loading, setLoading] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/onboarding/status");
        const data = await res.json();
        if (data.completed) {
          router.replace("/app");
          return;
        }
        setStatusLoaded(true);
      } catch {
        setStatusLoaded(true);
      }
    };
    fetchStatus();
  }, [router]);

  // Return from Stripe subscription success: complete onboarding and redirect to app
  useEffect(() => {
    if (successParam !== "1" || !statusLoaded) return;
    setLoading(true);
    fetch("/api/onboarding/complete", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          toast.success("Onboarding complete!");
          router.replace("/app");
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [successParam, statusLoaded, router]);

  const handleContinue = async () => {
    setLoading(true);
    try {
      await fetch("/api/onboarding/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "starter", installAddonSku: null }),
      });

      const session = await client.getSession();
      const userId = session?.data?.user?.id;
      if (!userId) {
        toast.error("Please sign in to continue.");
        setLoading(false);
        return;
      }

      const { data, error } = await client.subscription.upgrade({
        plan: "starter",
        referenceId: userId,
        successUrl: `${window.location.origin}/onboarding?success=1`,
        cancelUrl: `${window.location.origin}/onboarding`,
      });

      if (error) {
        toast.error(error.message || "Failed to start checkout");
        setLoading(false);
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!statusLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (successParam === "1") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Completing your setup…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-5 w-5" />
              Starter Plan
            </CardTitle>
            <CardDescription className="text-base">
              Free 14 days trial and $9.99/month after that.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Continue"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
