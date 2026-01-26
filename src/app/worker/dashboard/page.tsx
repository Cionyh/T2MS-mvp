"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2, Briefcase, DollarSign, CheckCircle2, Clock } from "lucide-react";
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
import { WORKER_AVAILABILITY } from "@/lib/job-status";

interface WorkerStats {
  worker: {
    id: string;
    availability: string;
    maxActiveJobs: number;
    activeJobCount: number;
    completedJobsCount: number;
    totalEarnings: number;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export default function WorkerDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WorkerStats | null>(null);
  const [availability, setAvailability] = useState<string>("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/workers/me");
        if (!response.ok) {
          throw new Error("Failed to fetch worker stats");
        }
        const data = await response.json();
        setStats(data);
        setAvailability(data.worker.availability);
      } catch (error) {
        console.error("Error fetching worker stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const handleAvailabilityChange = async (newAvailability: string) => {
    try {
      const response = await fetch("/api/workers/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ availability: newAvailability }),
      });

      if (!response.ok) {
        throw new Error("Failed to update availability");
      }

      const data = await response.json();
      setAvailability(data.worker.availability);
      setStats((prev) =>
        prev
          ? {
              ...prev,
              worker: { ...prev.worker, availability: data.worker.availability },
            }
          : null
      );
    } catch (error) {
      console.error("Error updating availability:", error);
    }
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

  if (!stats) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Failed to load worker dashboard
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { worker } = stats;
  const fullName = session?.user?.name?.trim() || "Worker";
  const firstName = fullName.split(" ")[0];

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome, {firstName}
            </h1>
            <p className="text-muted-foreground">
              Worker Dashboard - Manage your installation jobs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={
                availability === WORKER_AVAILABILITY.ON_SHIFT
                  ? "default"
                  : availability === WORKER_AVAILABILITY.PAUSED
                  ? "secondary"
                  : "outline"
              }
              className="text-sm"
            >
              {availability === WORKER_AVAILABILITY.ON_SHIFT
                ? "ON SHIFT"
                : availability === WORKER_AVAILABILITY.PAUSED
                ? "PAUSED"
                : "OFF SHIFT"}
            </Badge>
            <Link href="/worker/jobs">
              <Button>View Job Queue</Button>
            </Link>
          </div>
        </div>

        {/* Availability Toggle */}
        <Card>
          <CardHeader>
            <CardTitle>Availability Status</CardTitle>
            <CardDescription>
              Toggle your availability to claim jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={
                  availability === WORKER_AVAILABILITY.ON_SHIFT
                    ? "default"
                    : "outline"
                }
                onClick={() => handleAvailabilityChange(WORKER_AVAILABILITY.ON_SHIFT)}
                disabled={availability === WORKER_AVAILABILITY.ON_SHIFT}
              >
                Go On Shift
              </Button>
              <Button
                variant={
                  availability === WORKER_AVAILABILITY.PAUSED
                    ? "default"
                    : "outline"
                }
                onClick={() => handleAvailabilityChange(WORKER_AVAILABILITY.PAUSED)}
                disabled={availability === WORKER_AVAILABILITY.PAUSED}
              >
                Pause
              </Button>
              <Button
                variant={
                  availability === WORKER_AVAILABILITY.OFF_SHIFT
                    ? "default"
                    : "outline"
                }
                onClick={() => handleAvailabilityChange(WORKER_AVAILABILITY.OFF_SHIFT)}
                disabled={availability === WORKER_AVAILABILITY.OFF_SHIFT}
              >
                Go Off Shift
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              You can only claim jobs when you're{" "}
              <strong>ON SHIFT</strong>. Maximum {worker.maxActiveJobs} active
              jobs allowed.
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{worker.activeJobCount}</div>
              <p className="text-xs text-muted-foreground">
                Currently assigned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {worker.completedJobsCount}
              </div>
              <p className="text-xs text-muted-foreground">Total completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${worker.totalEarnings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Capacity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {worker.activeJobCount} / {worker.maxActiveJobs}
              </div>
              <p className="text-xs text-muted-foreground">Active / Max</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/worker/jobs">
            <Card className="hover:bg-muted transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>Job Queue</CardTitle>
                <CardDescription>
                  View and claim available installation jobs
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/worker/jobs?assignedToMe=true">
            <Card className="hover:bg-muted transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>My Active Jobs</CardTitle>
                <CardDescription>
                  View jobs you're currently working on
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/worker/payouts">
            <Card className="hover:bg-muted transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>Earnings & Payouts</CardTitle>
                <CardDescription>
                  View your earnings history and payout status
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
