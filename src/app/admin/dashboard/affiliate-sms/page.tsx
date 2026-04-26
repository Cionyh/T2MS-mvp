"use client";

import { useState } from "react";
import { useAffiliateInboundSms } from "@/lib/hooks/useAffiliateInboundSms";
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
import { Loader2 } from "lucide-react";

export default function AdminAffiliateSmsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAffiliateInboundSms({
    page,
    limit: 20,
  });

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
        No inbound messages to the affiliate / demo number yet.
      </p>
    );
  } else {
    content = (
      <>
        <Table>
          <TableCaption>
            Inbound SMS to the affiliate or demo Twilio number only (not customer sites).
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Received</TableHead>
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
    <Card className="mt-6 shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle>Affiliate / demo SMS</CardTitle>
        <p className="text-sm text-muted-foreground">
          Messages received on the dedicated affiliate or demo Twilio number. These are not
          linked to any client account.
        </p>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
