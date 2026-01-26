"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { client } from "@/lib/auth-client";
import {
  Loader2,
  Plus,
  Trash,
  Edit,
  Search,
  Briefcase,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { WORKER_AVAILABILITY } from "@/lib/job-status";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Worker {
  id: string;
  availability: string;
  maxActiveJobs: number;
  activeJobCount: number;
  completedJobCount: number;
  totalEarnings: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    assignedJobs: number;
    payouts: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function AdminWorkersPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [isLoading, setIsLoading] = useState<string | undefined>();

  const [createMode, setCreateMode] = useState<"existing" | "new">("existing");
  const [newWorker, setNewWorker] = useState<{
    userId: string;
    email: string;
    name: string;
    password: string;
    availability: string;
    maxActiveJobs: number;
  }>({
    userId: "",
    email: "",
    name: "",
    password: "",
    availability: WORKER_AVAILABILITY.OFF_SHIFT,
    maxActiveJobs: 2,
  });

  const [editWorker, setEditWorker] = useState<{
    availability: string;
    maxActiveJobs: number;
  }>({
    availability: WORKER_AVAILABILITY.OFF_SHIFT,
    maxActiveJobs: 2,
  });

  // Fetch workers
  const { data: workers, isLoading: isWorkersLoading } = useQuery({
    queryKey: ["admin-workers", search, availabilityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (availabilityFilter !== "all") params.append("availability", availabilityFilter);

      const response = await fetch(`/api/admin/workers?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch workers");
      }
      return response.json() as Promise<Worker[]>;
    },
  });

  // Fetch users for worker creation
  const { data: users } = useQuery({
    queryKey: ["admin-users-for-workers"],
    queryFn: async () => {
      const data = await client.admin.listUsers(
        {
          query: {
            limit: 1000, // Get all users
            sortBy: "createdAt",
            sortDirection: "desc",
          },
        },
        {
          throw: true,
        }
      );
      return data?.users || [];
    },
  });

  // Fetch existing workers to filter out users who are already workers
  const { data: existingWorkers } = useQuery({
    queryKey: ["admin-existing-workers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/workers");
      if (!response.ok) {
        return [];
      }
      return response.json() as Promise<Worker[]>;
    },
  });

  // Filter users - exclude those who are already workers
  const availableUsers = users?.filter(
    (user: User) => !existingWorkers?.some((w: Worker) => w.user.id === user.id)
  ) || [];

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading("create");
    try {
      const payload =
        createMode === "existing"
          ? {
              userId: newWorker.userId,
              availability: newWorker.availability,
              maxActiveJobs: newWorker.maxActiveJobs,
            }
          : {
              email: newWorker.email,
              name: newWorker.name,
              password: newWorker.password,
              availability: newWorker.availability,
              maxActiveJobs: newWorker.maxActiveJobs,
            };

      const response = await fetch("/api/admin/workers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create worker");
      }

      toast.success("Worker created successfully");
      setNewWorker({
        userId: "",
        email: "",
        name: "",
        password: "",
        availability: WORKER_AVAILABILITY.OFF_SHIFT,
        maxActiveJobs: 2,
      });
      setCreateMode("existing");
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-workers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-existing-workers"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to create worker");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleEditWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setEditWorker({
      availability: worker.availability,
      maxActiveJobs: worker.maxActiveJobs,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    setIsLoading("update");
    try {
      const response = await fetch(`/api/admin/workers/${selectedWorker.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editWorker),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update worker");
      }

      toast.success("Worker updated successfully");
      setIsEditDialogOpen(false);
      setSelectedWorker(null);
      queryClient.invalidateQueries({ queryKey: ["admin-workers"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to update worker");
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleDeleteWorker = async () => {
    if (!selectedWorker) return;

    setIsLoading("delete");
    try {
      const response = await fetch(`/api/admin/workers/${selectedWorker.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete worker");
      }

      toast.success("Worker deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedWorker(null);
      queryClient.invalidateQueries({ queryKey: ["admin-workers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-existing-workers"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete worker");
    } finally {
      setIsLoading(undefined);
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      [WORKER_AVAILABILITY.ON_SHIFT]: "default",
      [WORKER_AVAILABILITY.PAUSED]: "secondary",
      [WORKER_AVAILABILITY.OFF_SHIFT]: "outline",
    };

    return (
      <Badge variant={variants[availability] || "outline"}>
        {availability.replace(/_/g, " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Worker Management</h1>
          <p className="text-muted-foreground">
            Manage Philippines workers and their availability
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Worker
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Worker</DialogTitle>
              <DialogDescription>
                Create a new worker account or convert an existing user
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateWorker}>
              <div className="space-y-4 py-4">
                {/* Mode Toggle */}
                <div className="flex gap-2 border-b pb-4">
                  <Button
                    type="button"
                    variant={createMode === "existing" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCreateMode("existing")}
                    className="flex-1"
                  >
                    Convert Existing User
                  </Button>
                  <Button
                    type="button"
                    variant={createMode === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCreateMode("new")}
                    className="flex-1"
                  >
                    Create New User
                  </Button>
                </div>

                {createMode === "existing" ? (
                  <div className="space-y-2">
                    <Label htmlFor="userId">User</Label>
                    <Select
                      value={newWorker.userId}
                      onValueChange={(value) =>
                        setNewWorker({ ...newWorker, userId: value })
                      }
                      required={createMode === "existing"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No available users
                          </SelectItem>
                        ) : (
                          availableUsers.map((user: User) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {availableUsers.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        All users are already workers, or no users available
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={newWorker.name}
                        onChange={(e) =>
                          setNewWorker({ ...newWorker, name: e.target.value })
                        }
                        placeholder="John Doe"
                        required={createMode === "new"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newWorker.email}
                        onChange={(e) =>
                          setNewWorker({ ...newWorker, email: e.target.value })
                        }
                        placeholder="worker@example.com"
                        required={createMode === "new"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newWorker.password}
                        onChange={(e) =>
                          setNewWorker({ ...newWorker, password: e.target.value })
                        }
                        placeholder="Minimum 8 characters"
                        required={createMode === "new"}
                        minLength={8}
                      />
                      <p className="text-sm text-muted-foreground">
                        Worker will use this to log in to the worker portal
                      </p>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="availability">Initial Availability</Label>
                  <Select
                    value={newWorker.availability}
                    onValueChange={(value) =>
                      setNewWorker({ ...newWorker, availability: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={WORKER_AVAILABILITY.OFF_SHIFT}>
                        Off Shift
                      </SelectItem>
                      <SelectItem value={WORKER_AVAILABILITY.ON_SHIFT}>
                        On Shift
                      </SelectItem>
                      <SelectItem value={WORKER_AVAILABILITY.PAUSED}>
                        Paused
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxActiveJobs">Max Active Jobs</Label>
                  <Input
                    id="maxActiveJobs"
                    type="number"
                    min="1"
                    max="10"
                    value={newWorker.maxActiveJobs}
                    onChange={(e) =>
                      setNewWorker({
                        ...newWorker,
                        maxActiveJobs: parseInt(e.target.value) || 2,
                      })
                    }
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum number of active jobs this worker can have (1-10)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setCreateMode("existing");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isLoading === "create" ||
                    (createMode === "existing" && !newWorker.userId) ||
                    (createMode === "new" &&
                      (!newWorker.email || !newWorker.name || !newWorker.password))
                  }
                >
                  {isLoading === "create" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Worker
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search workers by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={WORKER_AVAILABILITY.ON_SHIFT}>On Shift</SelectItem>
            <SelectItem value={WORKER_AVAILABILITY.OFF_SHIFT}>Off Shift</SelectItem>
            <SelectItem value={WORKER_AVAILABILITY.PAUSED}>Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Workers Table */}
      <div className="border rounded-lg">
        {isWorkersLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-6 w-6 text-muted" />
          </div>
        ) : !workers || workers.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No workers found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Active Jobs</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Max Jobs</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{worker.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {worker.user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getAvailabilityBadge(worker.availability)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{worker.activeJobCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{worker.completedJobCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${worker.totalEarnings.toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {worker.activeJobCount} / {worker.maxActiveJobs}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditWorker(worker)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWorker(worker);
                          setIsDeleteDialogOpen(true);
                        }}
                        disabled={worker.activeJobCount > 0}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Worker</DialogTitle>
            <DialogDescription>
              Update worker availability and job capacity
            </DialogDescription>
          </DialogHeader>
          {selectedWorker && (
            <form onSubmit={handleUpdateWorker}>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Worker</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedWorker.user.name} ({selectedWorker.user.email})
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-availability">Availability</Label>
                  <Select
                    value={editWorker.availability}
                    onValueChange={(value) =>
                      setEditWorker({ ...editWorker, availability: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={WORKER_AVAILABILITY.OFF_SHIFT}>
                        Off Shift
                      </SelectItem>
                      <SelectItem value={WORKER_AVAILABILITY.ON_SHIFT}>
                        On Shift
                      </SelectItem>
                      <SelectItem value={WORKER_AVAILABILITY.PAUSED}>
                        Paused
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-maxActiveJobs">Max Active Jobs</Label>
                  <Input
                    id="edit-maxActiveJobs"
                    type="number"
                    min="1"
                    max="10"
                    value={editWorker.maxActiveJobs}
                    onChange={(e) =>
                      setEditWorker({
                        ...editWorker,
                        maxActiveJobs: parseInt(e.target.value) || 2,
                      })
                    }
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Current: {selectedWorker.activeJobCount} active jobs
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading === "update"}>
                  {isLoading === "update" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Worker"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Worker</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this worker? This action cannot be
              undone.
              {selectedWorker && selectedWorker.activeJobCount > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Warning: This worker has {selectedWorker.activeJobCount} active
                  job(s). Please reassign or complete jobs first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorker}
              disabled={isLoading === "delete" || (selectedWorker?.activeJobCount || 0) > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading === "delete" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
