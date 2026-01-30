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

interface InstallRequest {
  id: string;
  userId: string;
  planId: string;
  installAddonSku: string | null;
  installAddonStatus: string | null;
  websiteUrls: string[];
  platform: string | null;
  installType: string | null;
  preferredPlacement: string | null;
  accessMethod: string | null;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ApiResponse {
  data: InstallRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

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

  const getStatusBadge = (status: string | null) => {
    if (!status || status === "pending") {
      return <Badge variant="outline">Pending</Badge>;
    }
    if (status === "paid") {
      return <Badge className="bg-green-600">Paid</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getAddonLabel = (sku: string | null) => {
    if (!sku) return "—";
    return sku === "standard"
      ? "Standard (script)"
      : sku === "restricted"
        ? "Restricted (iframe)"
        : sku;
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
          Widget Install Requests
        </h1>
        <p className="text-muted-foreground mt-1">
          Customers who purchased the widget install add-on. Reach out to complete installations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Install Requests</CardTitle>
          <CardDescription>
            {data?.pagination.total ?? 0} total request{data?.pagination.total !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Add-on</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Website(s)</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Requested</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No install requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{req.user.name || "—"}</div>
                          <div className="text-sm text-muted-foreground">{req.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getAddonLabel(req.installAddonSku)}</TableCell>
                      <TableCell>{getStatusBadge(req.installAddonStatus)}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate text-sm" title={req.websiteUrls?.join(", ")}>
                          {req.websiteUrls?.length ? req.websiteUrls.join(", ") : "—"}
                        </div>
                      </TableCell>
                      <TableCell>{req.platform || "—"}</TableCell>
                      <TableCell className="text-sm">{req.accessMethod || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString()}
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
