"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wrench, Loader2, Plus, CreditCard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface InstallJob {
  id: string;
  status: string;
  platform: string;
  installType: string;
  websiteUrls: string[];
  accessMethod: string;
  createdAt: string;
}

export default function WidgetInstallRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [installJobs, setInstallJobs] = useState<InstallJob[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/install-jobs")
      .then((r) => r.json())
      .then((d) => setInstallJobs(Array.isArray(d.jobs) ? d.jobs : []))
      .catch(() => setInstallJobs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Widget install requests
          </h2>
          <p className="text-muted-foreground">
            View and track your widget installation requests.
          </p>
        </div>
        <Link href="/app/install-request">
          <Button className="text-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Get Widget Installed
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Your install requests
          </CardTitle>
          <CardDescription>
            Our team will install the widget on your site. Status updates appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : installJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No install requests yet.{" "}
              <Link
                href="/app/install-request"
                className="font-medium text-primary underline underline-offset-4"
              >
                Get Widget Installed
              </Link>{" "}
              to request a new install (payment required).
            </p>
          ) : (
            <div className="space-y-4">
              {installJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-lg border p-4 space-y-2"
                >
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
                            : job.status === "PENDING_PAYMENT"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-primary/10 text-primary"
                      }`}
                    >
                      {job.status === "QUEUED" ? "Installation In Progress" : job.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  {job.status === "PENDING_PAYMENT" && (
                    <Link href={`/app/install-request?jobId=${encodeURIComponent(job.id)}`}>
                      <Button size="sm" className="mt-2">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Complete payment
                      </Button>
                    </Link>
                  )}
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
