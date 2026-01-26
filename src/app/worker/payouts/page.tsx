"use client";

import { useEffect, useState } from "react";
import { Loader2, DollarSign, CheckCircle2, Clock, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PAYOUT_STATUS } from "@/lib/job-status";

interface Payout {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
  job: {
    id: string;
    platform: string;
    installType: string;
    websiteUrls: string[];
    status: string;
  };
}

interface PayoutSummary {
  totalAmount: number;
  totalCount: number;
  byStatus: Record<string, { amount: number; count: number }>;
}

export default function WorkerPayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<PayoutSummary | null>(null);

  useEffect(() => {
    fetchPayouts();
  }, []);

  async function fetchPayouts() {
    setLoading(true);
    try {
      const response = await fetch("/api/workers/me/payouts");
      if (!response.ok) {
        throw new Error("Failed to fetch payouts");
      }
      const data = await response.json();
      setPayouts(data.payouts);
      setSummary(data.summary);
    } catch (error) {
      console.error("Error fetching payouts:", error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      [PAYOUT_STATUS.EARNED]: "outline",
      [PAYOUT_STATUS.APPROVED]: "secondary",
      [PAYOUT_STATUS.PAID]: "default",
    };

    const icons: Record<string, typeof Clock> = {
      [PAYOUT_STATUS.EARNED]: Clock,
      [PAYOUT_STATUS.APPROVED]: CheckCircle2,
      [PAYOUT_STATUS.PAID]: DollarSign,
    };

    const Icon = icons[status] || Clock;

    return (
      <Badge variant={variants[status] || "outline"} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

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

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Earnings & Payouts</h1>
            <p className="text-muted-foreground">
              View your earnings history and payout status
            </p>
          </div>
          <Link href="/worker/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${summary.totalAmount.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.totalCount} payout{summary.totalCount !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>

            {Object.entries(summary.byStatus).map(([status, data]) => (
              <Card key={status}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">
                    {status.toLowerCase()}
                  </CardTitle>
                  {status === PAYOUT_STATUS.PAID ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : status === PAYOUT_STATUS.APPROVED ? (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${data.amount.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.count} payout{data.count !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Payouts List */}
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
            <CardDescription>
              All your earnings and payout records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payouts.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No payouts yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          ${payout.amount.toFixed(2)}
                        </span>
                        {getStatusBadge(payout.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>
                          {payout.job.platform} - {payout.job.installType} embed
                        </p>
                        <p>
                          Created: {new Date(payout.createdAt).toLocaleDateString()}
                          {payout.paidAt &&
                            ` • Paid: ${new Date(payout.paidAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <Link href={`/worker/jobs/${payout.job.id}`}>
                      <Button variant="outline" size="sm">
                        View Job
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
