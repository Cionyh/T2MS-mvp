"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Briefcase, Clock, MapPin, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { INSTALL_JOB_STATUS } from "@/lib/job-status";
import { toast } from "sonner";

interface Job {
  id: string;
  platform: string;
  installType: string;
  websiteUrls: string[];
  status: string;
  priority: number;
  createdAt: string;
  customer: {
    user: {
      name: string;
      email: string;
    };
  };
  assignedWorker: {
    user: {
      name: string;
    };
  } | null;
  _count: {
    proofs: number;
  };
}

export default function WorkerJobsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [claiming, setClaiming] = useState<string | null>(null);
  const assignedToMe = searchParams.get("assignedToMe") === "true";

  useEffect(() => {
    fetchJobs();
  }, [assignedToMe]);

  async function fetchJobs() {
    setLoading(true);
    try {
      const url = assignedToMe
        ? "/api/jobs?assignedToMe=true"
        : "/api/jobs?status=QUEUED";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim(jobId: string) {
    setClaiming(jobId);
    try {
      const response = await fetch(`/api/jobs/${jobId}/claim`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to claim job");
      }

      toast.success("Job claimed successfully!");
      router.push(`/worker/jobs/${jobId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to claim job");
    } finally {
      setClaiming(null);
      fetchJobs(); // Refresh list
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      [INSTALL_JOB_STATUS.QUEUED]: "outline",
      [INSTALL_JOB_STATUS.ASSIGNED]: "secondary",
      [INSTALL_JOB_STATUS.IN_PROGRESS]: "default",
      [INSTALL_JOB_STATUS.SUBMITTED_FOR_QA]: "secondary",
      [INSTALL_JOB_STATUS.NEEDS_FIX]: "destructive",
      [INSTALL_JOB_STATUS.COMPLETED]: "default",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {assignedToMe ? "My Active Jobs" : "Job Queue"}
            </h1>
            <p className="text-muted-foreground">
              {assignedToMe
                ? "Jobs you're currently working on"
                : "Available installation jobs"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={!assignedToMe ? "default" : "outline"}
              onClick={() => router.push("/worker/jobs")}
            >
              Available Jobs
            </Button>
            <Button
              variant={assignedToMe ? "default" : "outline"}
              onClick={() => router.push("/worker/jobs?assignedToMe=true")}
            >
              My Jobs
            </Button>
            <Link href="/worker/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {assignedToMe
                    ? "You don't have any active jobs"
                    : "No jobs available in the queue"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {job.platform} Installation
                        </CardTitle>
                        {getStatusBadge(job.status)}
                      </div>
                      <CardDescription>
                        Customer: {job.customer.user.name} ({job.customer.user.email})
                      </CardDescription>
                    </div>
                    {job.priority > 0 && (
                      <Badge variant="destructive">Priority</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Platform:</span>
                        <span className="font-medium">{job.platform}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium capitalize">
                          {job.installType} embed
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {job._count.proofs > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Proofs:</span>
                          <span className="font-medium">{job._count.proofs}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Website URLs:</p>
                      <div className="flex flex-wrap gap-2">
                        {job.websiteUrls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            {url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {!assignedToMe && job.status === INSTALL_JOB_STATUS.QUEUED && (
                        <Button
                          onClick={() => handleClaim(job.id)}
                          disabled={claiming === job.id}
                        >
                          {claiming === job.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Claiming...
                            </>
                          ) : (
                            "Claim Job"
                          )}
                        </Button>
                      )}
                      <Link href={`/worker/jobs/${job.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
