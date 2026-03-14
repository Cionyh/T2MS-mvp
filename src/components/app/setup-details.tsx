"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Plan + add-on only. Install setup data lives in InstallJob (see installJobs).
interface OnboardingData {
  planId: string;
  installAddonSku: string | null;
  installAddonStatus: string | null;
  completedAt: string | null;
}

export function SetupDetailsTab() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OnboardingData | null>(null);
  useEffect(() => {
    fetchOnboarding();
  }, []);

  const fetchOnboarding = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding");
      const json = await res.json();
      if (json.onboarding) {
        setData(json.onboarding);
      } else {
        setData(null);
      }
    } catch {
      toast.error("Failed to load setup details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan & Add-on (from Onboarding table only) */}
      {data ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Plan & Add-on
            </CardTitle>
            <CardDescription>
              Your selected plan and install add-on (billing).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Plan: <span className="font-medium">{data.planId}</span>
              {data.installAddonSku && (
                <> · Install add-on: {data.installAddonSku} ({data.installAddonStatus ?? "pending"})</>
              )}
            </p>
            <Button className="mt-2" variant="outline" size="sm" asChild>
              <Link href="/app/change-plan">Change plan</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Setup
            </CardTitle>
            <CardDescription>
              Complete onboarding to choose your plan and optional install add-on.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/onboarding")}>
              Complete onboarding
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
