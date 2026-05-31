"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Church, Check, X } from "lucide-react";
import { toast } from "sonner";
import { churchVerificationLabel } from "@/lib/church-verification";

type ChurchRequest = {
  userId: string;
  organizationName: string | null;
  status: string | null;
  verifiedAt: string | null;
  priceLockedUntil: string | null;
  planId: string;
  updatedAt: string;
  userName: string;
  userEmail: string;
  businessCategory: string | null;
};

export default function ChurchVerificationsPage() {
  const queryClient = useQueryClient();
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-church-verifications"],
    queryFn: async () => {
      const res = await fetch("/api/admin/church-verifications");
      if (!res.ok) throw new Error("Failed to load church verifications");
      return res.json() as Promise<{ requests: ChurchRequest[] }>;
    },
  });

  const requests = data?.requests ?? [];

  const updateStatus = async (
    userId: string,
    status: "verified" | "rejected" | "pending"
  ) => {
    setActionUserId(userId);
    try {
      const res = await fetch("/api/admin/church-verifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || "Update failed");
      }
      toast.success(
        status === "verified"
          ? "Church verification approved."
          : status === "rejected"
            ? "Church verification rejected."
            : "Verification reset to pending."
      );
      await queryClient.invalidateQueries({ queryKey: ["admin-church-verifications"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Church className="h-6 w-6" />
          Church verifications
        </h1>
        <p className="text-muted-foreground mt-1">
          Review church intro pricing eligibility ($7.99/mo, 14-day trial, 3-year price lock).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verification requests</CardTitle>
          <CardDescription>
            Approve verified churches and religious organizations for introductory launch pricing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No church verification requests yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.userId}>
                    <TableCell>
                      <p className="font-medium">{req.organizationName || "—"}</p>
                      {req.businessCategory ? (
                        <p className="text-xs text-muted-foreground">{req.businessCategory}</p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <p>{req.userName}</p>
                      <p className="text-xs text-muted-foreground">{req.userEmail}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          req.status === "verified"
                            ? "default"
                            : req.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {churchVerificationLabel(req.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(req.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionUserId === req.userId || req.status === "verified"}
                        onClick={() => updateStatus(req.userId, "verified")}
                      >
                        {actionUserId === req.userId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={actionUserId === req.userId || req.status === "rejected"}
                        onClick={() => updateStatus(req.userId, "rejected")}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
