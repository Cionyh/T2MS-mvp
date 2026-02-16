"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Upload, FileText, Lock, Unlock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { INSTALL_JOB_STATUS } from "@/lib/job-status";

function formatExpiry(value: unknown): string {
  if (value == null) return "";
  const str = String(value).trim();
  if (!str) return "";
  const date = new Date(str);
  if (Number.isNaN(date.getTime())) return str;
  return format(date, "MMM d, yyyy 'at' h:mm a");
}

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
  proofs: Array<{
    id: string;
    type: string;
    fileUrl: string;
    uploadedAt: string;
  }>;
}

interface ChecklistState {
  widgetLoadsDesktop: boolean;
  widgetLoadsMobile: boolean;
  messagingUIOpens: boolean;
  testMessageSends: boolean;
  incomingMessageReachesChannel: boolean;
  replyReachesTestPhone: boolean;
  noLayoutOrConsoleErrors: boolean;
}

export default function WorkerJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [checklist, setChecklist] = useState<ChecklistState>({
    widgetLoadsDesktop: false,
    widgetLoadsMobile: false,
    messagingUIOpens: false,
    testMessageSends: false,
    incomingMessageReachesChannel: false,
    replyReachesTestPhone: false,
    noLayoutOrConsoleErrors: false,
  });
  const [submittingChecklist, setSubmittingChecklist] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [submittingJob, setSubmittingJob] = useState(false);
  const [showCredentials, setShowCredentials] = useState(true);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  async function fetchJob() {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch job");
      }
      const data = await response.json();
      setJob(data);
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Failed to load job");
    } finally {
      setLoading(false);
    }
  }

  async function handleChecklistSubmit() {
    setSubmittingChecklist(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/checklist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checklist),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit checklist");
      }

      toast.success("Checklist submitted successfully!");
      fetchJob(); // Refresh job data
    } catch (error: any) {
      toast.error(error.message || "Failed to submit checklist");
    } finally {
      setSubmittingChecklist(false);
    }
  }

  async function handleProofUpload(type: "desktop" | "mobile" | "message") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,application/pdf";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setUploadingProof(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        const response = await fetch(`/api/jobs/${jobId}/proof`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to upload proof");
        }

        toast.success(`${type} proof uploaded successfully!`);
        fetchJob(); // Refresh job data
      } catch (error: any) {
        toast.error(error.message || "Failed to upload proof");
      } finally {
        setUploadingProof(false);
      }
    };
    input.click();
  }

  async function handleSubmitForQA() {
    setSubmittingJob(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/submit`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit job");
      }

      toast.success("Job submitted for QA successfully!");
      router.push("/worker/jobs?assignedToMe=true");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit job");
    } finally {
      setSubmittingJob(false);
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

  const allChecklistItemsChecked = Object.values(checklist).every((v) => v === true);
  const hasDesktopProof = job?.proofs.some((p) => p.type === "desktop");
  const hasMobileProof = job?.proofs.some((p) => p.type === "mobile");
  const hasMessageProof = job?.proofs.some((p) => p.type === "message");
  const allProofsUploaded = hasDesktopProof && hasMobileProof && hasMessageProof;
  const canSubmit = allChecklistItemsChecked && allProofsUploaded && job?.checklistCompleted;

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

  if (!job) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Job not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parse credentials JSON (access method is on job.accessMethod, not inside credentials)
  let credentials: Record<string, unknown> | null = null;
  if (job.accessCredentials) {
    try {
      const parsed = JSON.parse(job.accessCredentials);
      credentials = typeof parsed === "object" && parsed !== null ? parsed : null;
    } catch (e) {
      console.error("Failed to parse credentials", e);
    }
  }
  const accessMethod = (job.accessMethod || "").toLowerCase().replace(/-/g, "_");

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {job.platform} Installation
              </h1>
              {getStatusBadge(job.status)}
            </div>
            <p className="text-muted-foreground">
              Customer: {job.customer.user.name} ({job.customer.user.email})
            </p>
          </div>
          <Link href="/worker/jobs">
            <Button variant="outline">Back to Queue</Button>
          </Link>
        </div>

        {/* Job Information */}
        <Card>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Platform:</span>
                <p className="font-medium">{job.platform}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Install Type:</span>
                <p className="font-medium capitalize">{job.installType} embed</p>
              </div>
              <div>
                <span className="text-muted-foreground">Access Method:</span>
                <p className="font-medium capitalize">
                  {job.accessMethod.replace(/_/g, " ")}
                </p>
              </div>
              {job.preferredPlacement && (
                <div>
                  <span className="text-muted-foreground">Preferred Placement:</span>
                  <p className="font-medium">{job.preferredPlacement}</p>
                </div>
              )}
            </div>

            <div>
              <span className="text-sm text-muted-foreground">Website URLs:</span>
              <ul className="list-disc list-inside mt-1">
                {job.websiteUrls.map((url, idx) => (
                  <li key={idx}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {job.notes && (
              <div>
                <span className="text-sm text-muted-foreground">Notes:</span>
                <p className="mt-1">{job.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Access Credentials - show for assigned jobs (worker viewing their job) or when credentials exist */}
        {(job.assignedWorker || job.accessCredentials) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Access Credentials</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCredentials(!showCredentials)}
                >
                  {showCredentials ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Unlock className="mr-2 h-4 w-4" />
                      Show
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            {showCredentials && (
              <CardContent>
                {!credentials || Object.keys(credentials).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No access credentials provided for this job.</p>
                ) : accessMethod === "temporary_login" || credentials.adminUrl != null ? (
                  <div className="space-y-2 text-sm">
                    {credentials.adminUrl != null && (
                      <div>
                        <span className="text-muted-foreground">Admin URL:</span>
                        <p className="font-mono break-all">{String(credentials.adminUrl)}</p>
                      </div>
                    )}
                    {credentials.username != null && (
                      <div>
                        <span className="text-muted-foreground">Username:</span>
                        <p className="font-mono">{String(credentials.username)}</p>
                      </div>
                    )}
                    {credentials.password != null && (
                      <div>
                        <span className="text-muted-foreground">Password:</span>
                        <p className="font-mono">{String(credentials.password)}</p>
                      </div>
                    )}
                    {credentials.expiry != null && (
                      <div>
                        <span className="text-muted-foreground">Expiry:</span>
                        <p>{formatExpiry(credentials.expiry)}</p>
                      </div>
                    )}
                  </div>
                ) : accessMethod === "admin_invite" || credentials.email != null ? (
                  <div className="space-y-2 text-sm">
                    {credentials.email != null && (
                      <div>
                        <span className="text-muted-foreground">Invite email:</span>
                        <p className="font-mono">{String(credentials.email)}</p>
                      </div>
                    )}
                    {credentials.sender != null && (
                      <div>
                        <span className="text-muted-foreground">Sender:</span>
                        <p>{String(credentials.sender)}</p>
                      </div>
                    )}
                  </div>
                ) : accessMethod === "instructions" || credentials.steps != null ? (
                  <div className="space-y-2 text-sm">
                    <span className="text-muted-foreground">Instructions:</span>
                    <pre className="whitespace-pre-wrap bg-muted p-3 rounded text-sm">
                      {credentials.steps != null ? String(credentials.steps) : "No instructions."}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    {Object.entries(credentials).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                        <p className="font-mono break-all">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* QA Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>QA Checklist</CardTitle>
            <CardDescription>
              Complete all items before submitting for QA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "widgetLoadsDesktop", label: "Widget loads on desktop" },
              { key: "widgetLoadsMobile", label: "Widget loads on mobile" },
              { key: "messagingUIOpens", label: "Messaging UI opens" },
              { key: "testMessageSends", label: "Test message sends" },
              {
                key: "incomingMessageReachesChannel",
                label: "Incoming message reaches correct channel",
              },
              { key: "replyReachesTestPhone", label: "Reply reaches test phone" },
              {
                key: "noLayoutOrConsoleErrors",
                label: "No layout or console errors",
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center space-x-2">
                <Checkbox
                  id={item.key}
                  checked={checklist[item.key as keyof ChecklistState]}
                  onCheckedChange={(checked) =>
                    setChecklist((prev) => ({
                      ...prev,
                      [item.key]: checked === true,
                    }))
                  }
                  disabled={job.checklistCompleted}
                />
                <Label
                  htmlFor={item.key}
                  className="text-sm font-normal cursor-pointer"
                >
                  {item.label}
                </Label>
              </div>
            ))}

            {job.checklistCompleted && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Checklist completed</span>
              </div>
            )}

            {!job.checklistCompleted && (
              <Button
                onClick={handleChecklistSubmit}
                disabled={!allChecklistItemsChecked || submittingChecklist}
              >
                {submittingChecklist ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Checklist"
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Proof Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Proof Uploads</CardTitle>
            <CardDescription>
              Upload screenshots and message proof (Max 10MB each, PNG/JPG/PDF)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { type: "desktop", label: "Desktop Screenshot", required: true },
              { type: "mobile", label: "Mobile/Responsive Screenshot", required: true },
              { type: "message", label: "Message Send + Receive Proof", required: true },
            ].map(({ type, label, required }) => {
              const proof = job.proofs.find((p) => p.type === type);
              return (
                <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {proof ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                    )}
                    <div>
                      <Label className="font-medium">{label}</Label>
                      {required && <span className="text-red-500 ml-1">*</span>}
                      {proof && (
                        <p className="text-xs text-muted-foreground">
                          Uploaded {new Date(proof.uploadedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant={proof ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleProofUpload(type as any)}
                    disabled={uploadingProof}
                  >
                    {uploadingProof ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : proof ? (
                      "Replace"
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              );
            })}

            {job.proofUploaded && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>All required proofs uploaded</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit for QA */}
        {job.status !== INSTALL_JOB_STATUS.COMPLETED &&
          job.status !== INSTALL_JOB_STATUS.SUBMITTED_FOR_QA && (
            <Card>
              <CardHeader>
                <CardTitle>Submit for QA</CardTitle>
                <CardDescription>
                  Submit this job for quality assurance review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {job.checklistCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2" />
                      )}
                      <span>QA Checklist completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {allProofsUploaded ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2" />
                      )}
                      <span>All proofs uploaded</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmitForQA}
                    disabled={!canSubmit || submittingJob}
                    className="w-full"
                  >
                    {submittingJob ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit for QA"
                    )}
                  </Button>

                  {!canSubmit && (
                    <p className="text-sm text-muted-foreground">
                      Complete checklist and upload all proofs to submit
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
