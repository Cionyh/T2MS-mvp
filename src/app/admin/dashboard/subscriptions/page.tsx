"use client";

import { useState } from "react";
import {
  useAdminSubscriptions,
  useUpdateSubscription,
  useCancelSubscription,
  Subscription,
} from "@/lib/hooks/useAdminSubscriptions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit, Trash2, XCircle, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [deletingSubscriptionId, setDeletingSubscriptionId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useAdminSubscriptions({
    page,
    limit: 10,
    search,
    status: statusFilter === "all" ? "" : statusFilter,
    plan: planFilter === "all" ? "" : planFilter,
    enabled: true,
  });

  const updateSubscription = useUpdateSubscription();
  const cancelSubscription = useCancelSubscription();

  const isUpdating = updateSubscription.isPending;
  const isDeleting = cancelSubscription.isPending;

  const handleSave = () => {
    if (!editingSubscription) return;
    updateSubscription.mutate(
      {
        id: editingSubscription.id,
        data: editingSubscription,
      },
      {
        onSuccess: () => {
          setEditingSubscription(null);
          refetch();
          toast.success("Subscription updated successfully");
        },
        onError: () => {
          toast.error("Failed to update subscription");
        },
      }
    );
  };

  const handleCancel = (id: string) => {
    cancelSubscription.mutate(id, {
      onSuccess: () => {
        refetch();
        toast.success("Subscription cancelled successfully");
      },
      onError: () => {
        toast.error("Failed to cancel subscription");
      },
    });
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "trialing":
        return <Badge className="bg-blue-500">Trial</Badge>;
      case "canceled":
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "past_due":
        return <Badge className="bg-yellow-500">Past Due</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    const planColors: Record<string, string> = {
      basic: "bg-gray-500",
      pro: "bg-blue-500",
      enterprise: "bg-purple-500",
    };
    
    const basePlan = plan.split("_")[0];
    const color = planColors[basePlan] || "bg-gray-500";
    
    return <Badge className={color}>{basePlan.charAt(0).toUpperCase() + basePlan.slice(1)}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin h-6 w-6 text-muted" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-red-500">Failed to load subscriptions.</p>;
  }

  return (
    <div className="space-y-6 p-6 bg-muted rounded-2xl">
      <h1 className="text-2xl font-bold">Subscriptions Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 max-w-sm"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trialing">Trial</SelectItem>
            <SelectItem value="canceled">Cancelled</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
          </SelectContent>
        </Select>

        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
            setPlanFilter("all");
            setPage(1);
          }}
        >
          Clear Filters
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Trial</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell>{getPlanBadge(subscription.plan)}</TableCell>
                <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                <TableCell>
                  {subscription.user ? (
                    <div>
                      <div className="font-medium">{subscription.user.name}</div>
                      <div className="text-sm text-muted-foreground">{subscription.user.email}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No user</span>
                  )}
                </TableCell>
                <TableCell>{subscription.seats || "N/A"}</TableCell>
                <TableCell>
                  {subscription.periodStart && subscription.periodEnd ? (
                    <div className="text-sm">
                      <div>{new Date(subscription.periodStart).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">
                        to {new Date(subscription.periodEnd).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {subscription.trialStart && subscription.trialEnd ? (
                    <div className="text-sm">
                      <div>{new Date(subscription.trialStart).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">
                        to {new Date(subscription.trialEnd).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    "No trial"
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  {/* Edit Dialog */}
                  <Dialog
                    open={!!editingSubscription && editingSubscription.id === subscription.id}
                    onOpenChange={(open) => !open && setEditingSubscription(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingSubscription(subscription)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Subscription</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label htmlFor="plan">Plan</Label>
                          <Input
                            id="plan"
                            value={editingSubscription?.plan ?? ""}
                            onChange={(e) =>
                              setEditingSubscription((prev) =>
                                prev ? { ...prev, plan: e.target.value } : null
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={editingSubscription?.status ?? ""}
                            onValueChange={(value) =>
                              setEditingSubscription((prev) =>
                                prev ? { ...prev, status: value } : null
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="trialing">Trial</SelectItem>
                              <SelectItem value="canceled">Cancelled</SelectItem>
                              <SelectItem value="past_due">Past Due</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="seats">Seats</Label>
                          <Input
                            id="seats"
                            type="number"
                            value={editingSubscription?.seats ?? ""}
                            onChange={(e) =>
                              setEditingSubscription((prev) =>
                                prev ? { ...prev, seats: parseInt(e.target.value) || null } : null
                              )
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleSave} disabled={isUpdating}>
                          {isUpdating ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Cancel Subscription */}
                  {subscription.status === "active" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeletingSubscriptionId(subscription.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this subscription? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="space-x-2">
                          <AlertDialogCancel
                            onClick={() => setDeletingSubscriptionId(null)}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleCancel(subscription.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                              "Cancel Subscription"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            variant="outline"
          >
            Previous
          </Button>
          <span>
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button
            disabled={page === data.pagination.totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
