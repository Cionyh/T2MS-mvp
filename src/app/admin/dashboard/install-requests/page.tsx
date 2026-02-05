"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wrench } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InstallJobRow {
  id: string;
  customerId: string;
  platform: string;
  installType: string;
  websiteUrls: string[];
  preferredPlacement: string | null;
  accessMethod: string;
  notes: string | null;
  status: string;
  priority: number;
  createdAt: string;
  customer: {
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  };
}

interface ApiResponse {
  data: InstallJobRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const JOB_STATUSES = [
  "QUEUED",
  "ASSIGNED",
  "IN_PROGRESS",
  "BLOCKED_WAITING_CUSTOMER",
  "SUBMITTED_FOR_QA",
  "NEEDS_FIX",
  "COMPLETED",
  "CANCELLED",
  "HOLD_FINANCE_REVIEW",
];

export default function AdminInstallRequestsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/install-requests?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
        setIsError(false);
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, [page, statusFilter]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      QUEUED: "outline",
      ASSIGNED: "secondary",
      IN_PROGRESS: "default",
      BLOCKED_WAITING_CUSTOMER: "destructive",
      SUBMITTED_FOR_QA: "secondary",
      NEEDS_FIX: "destructive",
      COMPLETED: "default",
      CANCELLED: "outline",
      HOLD_FINANCE_REVIEW: "secondary",
    };
    return (
      <Badge variant={(map[status] as "outline" | "secondary" | "default" | "destructive") || "outline"}>
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  if (isLoading && !data) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-destructive">Failed to load install requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="h-6 w-6" />
          Install Requests (Install Jobs)
        </h1>
        <p className="text-muted-foreground mt-1">
          Widget install jobs from the install_job table. Assign team members and track status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Install Jobs</CardTitle>
          <CardDescription>
            {data?.pagination.total ?? 0} total job{data?.pagination.total !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {JOB_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Install type</TableHead>
                  <TableHead>Website(s)</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Requested</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No install jobs found. Run the migration if install_job table is new.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{job.customer?.user?.name ?? "—"}</div>
                          <div className="text-sm text-muted-foreground">{job.customer?.user?.email ?? "—"}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>{job.platform || "—"}</TableCell>
                      <TableCell>{job.installType || "—"}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate text-sm" title={job.websiteUrls?.join(", ")}>
                          {job.websiteUrls?.length ? job.websiteUrls.join(", ") : "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{job.accessMethod || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {data && data.pagination.totalPages > 1 && (
            <div className="flex justify-between items-center pt-4">
              <Button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.pagination.totalPages}
              </span>
              <Button
                disabled={page === data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
