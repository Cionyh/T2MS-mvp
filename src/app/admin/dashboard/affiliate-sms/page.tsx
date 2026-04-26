"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAffiliateInboundSms } from "@/lib/hooks/useAffiliateInboundSms";
import type { AffiliateInboundSmsRow } from "@/lib/hooks/useAffiliateInboundSms";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminAffiliateSmsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAffiliateInboundSms({
    page,
    limit: 20,
  });

  const [deleteTarget, setDeleteTarget] = useState<AffiliateInboundSmsRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/affiliate-sms/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || "Delete failed");
      }
      toast.success("SMS log deleted");
      setDeleteTarget(null);
      await queryClient.invalidateQueries({ queryKey: ["adminAffiliateInboundSms"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  }

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  } else if (error) {
    content = (
      <p className="text-red-500 text-sm">
        Failed to load: {error.message}
      </p>
    );
  } else if (!data || data.data.length === 0) {
    content = (
      <p className="text-muted-foreground text-sm">
        No inbound messages to the affiliate number yet.
      </p>
    );
  } else {
    content = (
      <>
        <Table>
          <TableCaption>
            Inbound SMS to the affiliate Twilio number (not customer sites).
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-sm whitespace-nowrap">
                  {row.fromPhone}
                </TableCell>
                <TableCell className="font-mono text-sm whitespace-nowrap">
                  {row.toPhone}
                </TableCell>
                <TableCell className="max-w-md break-words">
                  {row.body || "—"}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {new Date(row.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(row)}
                    aria-label="Delete log"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={!data.pagination.hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <p className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages} (
            {data.pagination.total} total)
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={!data.pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Card className="mt-6 shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle>Affiliate SMS</CardTitle>
          <p className="text-sm text-muted-foreground">
            Messages received on the dedicated affiliate Twilio number. These are not linked to
            any client account.
          </p>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete SMS log?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the log entry from the database. It does not affect customer sites or
              Twilio history.
              {deleteTarget ? (
                <span className="mt-2 block font-mono text-xs text-foreground">
                  From {deleteTarget.fromPhone} · {new Date(deleteTarget.createdAt).toLocaleString()}
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
