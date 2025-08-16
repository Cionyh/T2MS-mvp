"use client";
/* eslint-disable */

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

import { useMessages, useDeleteMessage } from "@/lib/hooks/useMessages";

interface Props {
  userId: string;
}

export default function MessagesPage({ userId }: Props) {
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  // Fetch messages
  const { data, isLoading, isError } = useMessages({
    page,
    limit,
    userId,
  });

  // Delete message hook
  const deleteMessage = useDeleteMessage();

  if (isLoading) return <p>Loading messages...</p>;
  if (isError) return <p>Failed to load messages</p>;

  // Calculate pagination
  const hasPrevPage = page > 1;
  const hasNextPage = data ? page < data.pagination.totalPages : false;

  return (
    <div className="p-4 md:p-8 space-y-6 bg-background rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
  
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
          {data?.data.map((msg) => (
            <TableRow key={msg.id}>
              <TableCell>{msg.client.name}</TableCell>
              <TableCell>{msg.client.domain}</TableCell>
              <TableCell>{msg.type}</TableCell>
              <TableCell>{msg.content}</TableCell>
              <TableCell>
                {new Date(msg.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMessage.mutate(msg.id)}
                  disabled={deleteMessage.isPending}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <Button disabled={!hasPrevPage} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Previous
        </Button>
        <span>
          Page {page} of {data?.pagination.totalPages}
        </span>
        <Button disabled={!hasNextPage} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
