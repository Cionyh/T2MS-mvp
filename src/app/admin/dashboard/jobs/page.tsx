"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Search,
  Eye,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { INSTALL_JOB_STATUS } from "@/lib/job-status";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InstallJob {
  id: string;
  platform: string;
  installType: string;
  websiteUrls: string[];
  status: string;
  priority: number;
  checklistCompleted: boolean;
  proofUploaded: boolean;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  assignedWorker: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
  _count: {
    proofs: number;
  };
}

export default function AdminJobsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [workerFilter, setWorkerFilter] = useState("all");

  // Fetch workers for filter dropdown
  const { data: workersData } = useQuery({
    queryKey: ["admin-workers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/workers");
      if (!response.ok) throw new Error("Failed to fetch workers");
      const data = await response.json();
      return data.workers || [];
    },
  });

  // Fetch jobs
  const { data: jobs, isLoading, error } = useQuery<InstallJob[]>({
    queryKey: ["admin-jobs", statusFilter, workerFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (workerFilter !== "all") {
        params.append("workerId", workerFilter);
      }
      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      const data = await response.json();
      return data || [];
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      [INSTALL_JOB_STATUS.QUEUED]: "outline",
      [INSTALL_JOB_STATUS.ASSIGNED]: "secondary",
      [INSTALL_JOB_STATUS.IN_PROGRESS]: "default",
      [INSTALL_JOB_STATUS.SUBMITTED_FOR_QA]: "default",
      [INSTALL_JOB_STATUS.NEEDS_FIX]: "destructive",
      [INSTALL_JOB_STATUS.COMPLETED]: "default",
      [INSTALL_JOB_STATUS.CANCELLED]: "outline",
      [INSTALL_JOB_STATUS.BLOCKED_WAITING_CUSTOMER]: "outline",
      [INSTALL_JOB_STATUS.HOLD_FINANCE_REVIEW]: "outline",
    };

    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      [INSTALL_JOB_STATUS.QUEUED]: Clock,
      [INSTALL_JOB_STATUS.ASSIGNED]: Clock,
      [INSTALL_JOB_STATUS.IN_PROGRESS]: RefreshCw,
      [INSTALL_JOB_STATUS.SUBMITTED_FOR_QA]: AlertCircle,
      [INSTALL_JOB_STATUS.NEEDS_FIX]: XCircle,
      [INSTALL_JOB_STATUS.COMPLETED]: CheckCircle2,
      [INSTALL_JOB_STATUS.CANCELLED]: XCircle,
      [INSTALL_JOB_STATUS.BLOCKED_WAITING_CUSTOMER]: AlertCircle,
      [INSTALL_JOB_STATUS.HOLD_FINANCE_REVIEW]: AlertCircle,
    };

    const Icon = icons[status] || Clock;

    return (
      <Badge variant={variants[status] || "outline"} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  // Calculate stats
  const stats = jobs
    ? {
        total: jobs.length,
        queued: jobs.filter((j) => j.status === INSTALL_JOB_STATUS.QUEUED).length,
        inProgress: jobs.filter(
          (j) =>
            j.status === INSTALL_JOB_STATUS.ASSIGNED ||
            j.status === INSTALL_JOB_STATUS.IN_PROGRESS
        ).length,
        submittedForQA: jobs.filter(
          (j) => j.status === INSTALL_JOB_STATUS.SUBMITTED_FOR_QA
        ).length,
        completed: jobs.filter((j) => j.status === INSTALL_JOB_STATUS.COMPLETED).length,
      }
    : null;

  if (error) {
    return (
      <div className="container mx-auto py-8 text-red-500">
        <XCircle className="h-8 w-8" />
        <p className="mt-4">Error: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Install Jobs</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queued</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.queued}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Awaiting QA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.submittedForQA}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name, email, or website URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(INSTALL_JOB_STATUS).map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={workerFilter} onValueChange={setWorkerFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by worker" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Workers</SelectItem>
            {workersData?.map((worker: any) => (
              <SelectItem key={worker.id} value={worker.id}>
                {worker.user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Jobs Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading jobs...</p>
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Website URLs</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Proofs</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.customer.user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {job.customer.user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.platform}</div>
                      <div className="text-sm text-muted-foreground">
                        {job.installType === "iframe" ? "iFrame" : "Script"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {job.websiteUrls.length > 0 ? (
                        <a
                          href={job.websiteUrls[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {job.websiteUrls[0]}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">No URLs</span>
                      )}
                      {job.websiteUrls.length > 1 && (
                        <span className="text-sm text-muted-foreground ml-1">
                          +{job.websiteUrls.length - 1} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {job.assignedWorker ? (
                      <div>
                        <div className="font-medium">{job.assignedWorker.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {job.assignedWorker.user.email}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {job.proofUploaded ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{job._count.proofs}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(job.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/dashboard/jobs/${job.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-muted-foreground">No jobs found.</p>
      )}
    </div>
  );
}
