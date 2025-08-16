"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useMessages, useDeleteMessage } from "@/lib/hooks/useMessages";

interface Props {
  userId: string;
}

export default function MessagesClient({ userId }: Props) {
  const [page, setPage] = useState<number>(1);
  const [deleteId, setDeleteId] = useState<string | null>(null); // Track which message is being deleted
  const limit = 10;

  const { data, isLoading, isError } = useMessages({
    page,
    limit,
    userId,
  });

  const deleteMessage = useDeleteMessage();

  if (isLoading) return <p>Loading messages...</p>;
  if (isError) return <p>Failed to load messages</p>;

  const messages = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;


  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteMessage.mutateAsync(deleteId);
    setDeleteId(null); // Close dialog
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-background rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <Link href="/app">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Site Name</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((msg) => (
            <TableRow key={msg.id}>
              <TableCell>{msg.client.name}</TableCell>
              <TableCell>{msg.client.domain}</TableCell>
              <TableCell>{msg.type}</TableCell>
              <TableCell>{msg.content}</TableCell>
              <TableCell>{new Date(msg.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                <AlertDialog open={deleteId === msg.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deleteMessage.isPending}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this message? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="space-x-2">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Button
                        variant="destructive"
                        onClick={confirmDelete}
                        disabled={deleteMessage.isPending}
                      >
                        {deleteMessage.isPending ? "Deleting..." : "Delete"}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <Button disabled={!hasPrevPage} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button disabled={!hasNextPage} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
