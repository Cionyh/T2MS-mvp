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
import { Settings, Wrench, Loader2 } from "lucide-react";
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
  const [installJobs, setInstallJobs] = useState<Array<{
    id: string;
    status: string;
    platform: string;
    installType: string;
    websiteUrls: string[];
    accessMethod: string;
    createdAt: string;
  }>>([]);

  useEffect(() => {
    fetchOnboarding();
  }, []);

  useEffect(() => {
    fetch("/api/install-jobs")
      .then((r) => r.json())
      .then((d) => setInstallJobs(Array.isArray(d.jobs) ? d.jobs : []))
      .catch(() => setInstallJobs([]));
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
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/app/install-request">
            <Wrench className="mr-2 h-4 w-4" />
            Get Widget Installed
          </Link>
        </Button>
      </div>
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

      {/* Widget install requests (from install_job table) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Install requests (Install Jobs)
          </CardTitle>
          <CardDescription>
            Your widget install jobs. Our team will install the widget on your site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {installJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No install jobs yet. Use{" "}
              <Link href="/app/install-request" className="font-medium text-primary underline underline-offset-4">
                Get Widget Installed
              </Link>{" "}
              to request a new install (payment required).
            </p>
          ) : (
            <div className="space-y-4">
              {installJobs.map((job) => (
                <div key={job.id} className="rounded-lg border p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {job.platform} — {job.installType}
                    </span>
                    <span
                      className={`text-sm px-2 py-0.5 rounded ${
                        job.status === "COMPLETED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : job.status === "CANCELLED"
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary"
                      }`}
                    >
                      {job.status === "QUEUED" ? "Installation In Progress" : job.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Access: {job.accessMethod.replace(/_/g, " ")}
                  </p>
                  {job.websiteUrls?.length > 0 && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Target site(s):</span>{" "}
                      {job.websiteUrls.join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Requested {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
