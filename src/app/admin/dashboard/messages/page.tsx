// app/admin/messages/page.tsx
"use client";

import { useState } from "react";
import { useAdminMessages } from "@/lib/hooks/useAdminMessage";
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
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function AdminMessagesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useAdminMessages({
    page,
    limit: 10,
    search,
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1); // reset to first page when searching
  };

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  } else if (error) {
    content = (
      <p className="text-red-500">Failed to load messages: {error.message}</p>
    );
  } else if (!data || data.data.length === 0) {
    content = (
      <p className="text-muted-foreground text-sm">No messages found.</p>
    );
  } else {
    content = (
      <>
        <Table>
          <TableCaption>
            A list of all messages sent by clients
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((msg) => (
              <TableRow key={msg.id}>
                <TableCell className="max-w-[250px] truncate">
                  {msg.content}
                </TableCell>
                <TableCell>{msg.client.name}</TableCell>
                <TableCell>{msg.client.domain}</TableCell>
                <TableCell>{msg.client.user?.email || "N/A"}</TableCell>
                <TableCell>
                  {new Date(msg.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
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
            Page {data.pagination.page} of {data.pagination.totalPages}
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
    <Card className="mt-6 shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <form onSubmit={handleSearch} className="flex items-center gap-2 mt-2">
          <Input
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}
