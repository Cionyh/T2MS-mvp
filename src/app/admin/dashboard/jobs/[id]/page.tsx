"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  UserCheck,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { INSTALL_JOB_STATUS } from "@/lib/job-status";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";

interface Job {
  id: string;
  platform: string;
  installType: string;
  websiteUrls: string[];
  preferredPlacement: string | null;
  accessMethod: string;
  accessCredentials: string | null;
  notes: string | null;
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
  proofs: Array<{
    id: string;
    type: string;
    fileUrl: string;
    uploadedAt: string;
  }>;
}

interface Worker {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  availability: string;
  activeJobCount: number;
  maxActiveJobs: number;
}

export default function AdminJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const jobId = params.id as string;

  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch job
  const { data: job, isLoading, error } = useQuery<Job>({
    queryKey: ["admin-job", jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) throw new Error("Failed to fetch job");
      return response.json();
    },
  });

  // Fetch workers for reassignment
  const { data: workersData } = useQuery<Worker[]>({
    queryKey: ["admin-workers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/workers");
      if (!response.ok) throw new Error("Failed to fetch workers");
      const data = await response.json();
      return data.workers || [];
    },
  });

  const getStatusBadge = (status: string, assignedWorker: any) => {
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

    // Show "Unassigned" for QUEUED jobs with no worker, otherwise show status
    let displayText = status.replace(/_/g, " ");
    if (status === INSTALL_JOB_STATUS.QUEUED && !assignedWorker) {
      displayText = "Unassigned";
    }

    return (
      <Badge variant={variants[status] || "outline"}>
        {displayText}
      </Badge>
    );
  };

  const handleReassign = async () => {
    if (!job) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}/reassign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workerId: selectedWorkerId === "unassign" ? null : selectedWorkerId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reassign job");
      }

      const data = await response.json();
      toast.success(data.message || "Job reassigned successfully");
      setIsReassignDialogOpen(false);
      setSelectedWorkerId("");
      queryClient.invalidateQueries({ queryKey: ["admin-job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to reassign job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async () => {
    if (!job) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: reviewAction,
          notes: reviewNotes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to review job");
      }

      const data = await response.json();
      toast.success(data.message || "Job reviewed successfully");
      setIsReviewDialogOpen(false);
      setReviewNotes("");
      queryClient.invalidateQueries({ queryKey: ["admin-job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to review job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!job) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update status");
      }

      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto py-8 text-red-500">
        <XCircle className="h-8 w-8" />
        <p className="mt-4">Error: {(error as Error)?.message || "Job not found"}</p>
        <Link href="/admin/dashboard/jobs">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  // Parse access credentials
  let accessCredentials: any = null;
  if (job.accessCredentials) {
    try {
      accessCredentials = JSON.parse(job.accessCredentials);
    } catch (e) {
      // Invalid JSON, keep as null
    }
  }

  const canReviewQA = job.status === INSTALL_JOB_STATUS.SUBMITTED_FOR_QA;
  const availableWorkers = workersData?.filter(
    (w) => w.availability === "ON_SHIFT" || w.id === job.assignedWorker?.id
  ) || [];

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/dashboard/jobs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Job Details</h1>
        {getStatusBadge(job.status, job.assignedWorker)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Job ID</Label>
                <p className="font-mono text-sm">{job.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Platform</Label>
                <p>{job.platform}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Install Type</Label>
                <p>{job.installType === "iframe" ? "iFrame" : "Script"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Website URLs</Label>
                <div className="space-y-1">
                  {job.websiteUrls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline block"
                    >
                      {url}
                    </a>
                  ))}
                </div>
              </div>
              {job.preferredPlacement && (
                <div>
                  <Label className="text-muted-foreground">Preferred Placement</Label>
                  <p>{job.preferredPlacement}</p>
                </div>
              )}
              {job.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="whitespace-pre-wrap">{job.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Access Credentials */}
          <Card>
            <CardHeader>
              <CardTitle>Access Credentials</CardTitle>
              <CardDescription>Access method: {job.accessMethod.replace(/_/g, " ")}</CardDescription>
            </CardHeader>
            <CardContent>
              {accessCredentials ? (
                <div className="space-y-2">
                  {Object.entries(accessCredentials).map(([key, value]) => (
                    <div key={key}>
                      <Label className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </Label>
                      <p className="font-mono text-sm">{String(value)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No credentials available</p>
              )}
            </CardContent>
          </Card>

          {/* Proofs */}
          <Card>
            <CardHeader>
              <CardTitle>Proof Uploads</CardTitle>
              <CardDescription>
                {job.proofs.length} file(s) uploaded
                {job.proofUploaded && (
                  <CheckCircle2 className="inline ml-2 h-4 w-4 text-green-500" />
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {job.proofs.length > 0 ? (
                <div className="space-y-2">
                  {job.proofs.map((proof) => (
                    <div key={proof.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="capitalize">{proof.type}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(proof.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <a
                        href={proof.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No proofs uploaded yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p>{job.customer.user.name}</p>
              </div>
              <div className="mt-2">
                <Label className="text-muted-foreground">Email</Label>
                <p>{job.customer.user.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Worker Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Teammember Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.assignedWorker ? (
                <div>
                  <Label className="text-muted-foreground">Assigned Teammember</Label>
                  <p className="font-medium">{job.assignedWorker.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {job.assignedWorker.user.email}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Unassigned</p>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedWorkerId(job.assignedWorker?.id || "unassign");
                  setIsReassignDialogOpen(true);
                }}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Reassign Job
              </Button>
            </CardContent>
          </Card>

          {/* QA Review */}
          {canReviewQA && (
            <Card>
              <CardHeader>
                <CardTitle>QA Review</CardTitle>
                <CardDescription>This job is awaiting QA review</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setReviewAction("approve");
                      setIsReviewDialogOpen(true);
                    }}
                    disabled={isSubmitting}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setReviewAction("reject");
                      setIsReviewDialogOpen(true);
                    }}
                    disabled={isSubmitting}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={job.status}
                onValueChange={handleStatusUpdate}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(INSTALL_JOB_STATUS).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isSubmitting && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <Label className="text-muted-foreground">Priority</Label>
                <p>{job.priority}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Checklist Completed</Label>
                <p>{job.checklistCompleted ? "Yes" : "No"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p>{new Date(job.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p>{new Date(job.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reassign Dialog */}
      <Dialog open={isReassignDialogOpen} onOpenChange={setIsReassignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Job</DialogTitle>
            <DialogDescription>
              Assign this job to a different team member or release it back to the queue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Teammember</Label>
              <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team member or unassign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassign">Unassign (Release to Queue)</SelectItem>
                  {availableWorkers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.user.name} ({worker.user.email})
                      {worker.activeJobCount >= worker.maxActiveJobs && (
                        <span className="text-muted-foreground ml-1">
                          - At capacity ({worker.activeJobCount}/{worker.maxActiveJobs})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReassignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReassign} disabled={isSubmitting || !selectedWorkerId}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserCheck className="mr-2 h-4 w-4" />
              )}
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve" ? "Approve Job" : "Reject Job"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approve"
                ? "Approve this job and mark it as completed. A payout will be created for the team member."
                : "Reject this job and mark it as needs fix. The team member will need to address the issues."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Review Notes (Optional)</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any notes about this review..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={isSubmitting}
              variant={reviewAction === "approve" ? "default" : "destructive"}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : reviewAction === "approve" ? (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              {reviewAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
