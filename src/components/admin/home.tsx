"use client";
/* eslint-disable */

import { useMemo } from "react";
import Link from "next/link";

// ** Shadcn Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// ** Lucide React Icons
import {
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
} from "lucide-react";

// ** Recharts
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ** Hooks
import { useAdminClients } from "@/lib/hooks/useAdminClients";
import { useTotalUsers } from "@/lib/hooks/useTotalUsers";
import { useAdminMessages } from "@/lib/hooks/useAdminMessage";
import { Skeleton } from "../ui/skeleton";
import { useSession } from "@/lib/auth-client";

// ** Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background border rounded-lg shadow-sm">
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">{`Value: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  // ** Fetch total clients
  const { data: clientsData, isLoading: clientsLoading } = useAdminClients({
    page: 1,
    limit: 1, // just need total
    enabled: true,
  });
  const totalClients = clientsData?.pagination.total ?? 0;

   const { data: session, isPending } = useSession();
   const fullName = session?.user?.name?.trim() || "Guest";
   const firstName = fullName.split(" ")[0];

  // ** Fetch total users
  const { total: totalUsers, isLoading: usersLoading } = useTotalUsers();

  // ** Fetch total messages
  const { data: messagesData, isLoading: messagesLoading } = useAdminMessages({
    page: 1,
    limit: 1, // only need pagination.total
    enabled: true,
  });
  const totalMessages = messagesData?.pagination.total ?? 0;

  // ** Chart for total clients
  const chartData = useMemo(
    () => [{ name: "Total Websites", value: totalClients }],
    [totalClients]
  );

  return (
    <div className="space-y-4 p-4 md:p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Welcome back,{" "}
            <span className="font-bold">
              {isPending ? (
                <Skeleton className="inline-block h-6 w-24 rounded" />
              ) : (
                firstName
              )}
            </span>
          </h2>
          <p className="text-muted-foreground">
            Here's a snapshot of T2MS performance.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Link href={"/admin/dashboard/sites"}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
              <Globe className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
  {clientsLoading ? <Skeleton className="h-8 w-24" /> : totalClients}
</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                Manage all the registered sites
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={"/admin/dashboard/clients"}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
  {usersLoading ? <Skeleton className="h-8 w-24" /> : totalUsers}
</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                Manage all the registered users
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={"/admin/dashboard/messages"}>
          <Card className="bg-muted">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Messages Served</CardTitle>
              <MessageSquare className="h-5 w-5 text-foreground" />
            </CardHeader>
            <CardContent>
             <div className="text-2xl font-bold">
  {messagesLoading ? <Skeleton className="h-8 w-24" /> : totalMessages}
</div>
              <p className="text-xs text-foreground flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                Track all messages sent by clients
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={"/admin/dashboard/analytics"}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overall Analytics</CardTitle>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+18%</div>
              <p className="text-xs text-muted-foreground">Growth this quarter</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Chart Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle>Total Websites</CardTitle>
              <CardDescription>Current total number of registered websites</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#12970dff" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#12970dff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#12970dff"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorUv)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Link
                href="/admin/dashboard/sites"
                className="flex items-center justify-between p-3 bg-muted hover:bg-background transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5" />
                  <span className="font-medium">All Sites</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                href="/admin/dashboard/clients"
                className="flex items-center justify-between p-3 bg-muted hover:bg-background transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">View Clients</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                href="/admin/dashboard/messages"
                className="flex items-center justify-between p-3 bg-muted hover:bg-background transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-medium">Messages</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                href="/admin/dashboard/settings"
                className="flex items-center justify-between p-3 bg-muted hover:bg-background transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Settings</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
