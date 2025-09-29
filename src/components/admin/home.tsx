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
  CreditCard,
  DollarSign,
  TrendingUp,
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
  BarChart,
  Bar,
} from "recharts";

// ** Hooks
import { useAdminClients } from "@/lib/hooks/useAdminClients";
import { useTotalUsers } from "@/lib/hooks/useTotalUsers";
import { useAdminMessages } from "@/lib/hooks/useAdminMessage";
import { useSubscriptionStats } from "@/lib/hooks/useAdminSubscriptions";
import { Skeleton } from "../ui/skeleton";
import { useSession } from "@/lib/auth-client";

// ** Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-background border rounded-lg shadow-sm">
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-sm text-muted-foreground">
          {`Total: ${payload[0].value.toLocaleString()}`}
        </p>
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

  // ** Fetch subscription stats
  const { data: subscriptionStats, isLoading: subscriptionLoading } = useSubscriptionStats();

  // ** Chart data for all metrics
  const chartData = useMemo(
    () => [
      { 
        name: "Sites", 
        value: totalClients,
        color: "#8884d8"
      },
      { 
        name: "Users", 
        value: totalUsers,
        color: "#82ca9d"
      },
      { 
        name: "Messages", 
        value: totalMessages,
        color: "#ffc658"
      },
      { 
        name: "Subscriptions", 
        value: subscriptionStats?.totalSubscriptions || 0,
        color: "#ff7300"
      },
    ],
    [totalClients, totalUsers, totalMessages, subscriptionStats?.totalSubscriptions]
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

        <Link href={"/admin/analyze"}>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary">Analytics Dashboard</CardTitle>
              <BarChart3 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Comprehensive</div>
              <p className="text-xs text-primary/70">View detailed insights & trends</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Subscription KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link href={"/admin/dashboard/subscriptions"}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscriptionLoading ? <Skeleton className="h-8 w-24" /> : subscriptionStats?.totalSubscriptions || 0}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                All time subscriptions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={"/admin/dashboard/subscriptions"}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {subscriptionLoading ? <Skeleton className="h-8 w-24" /> : subscriptionStats?.activeSubscriptions || 0}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                Currently active
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={"/admin/dashboard/subscription-analytics"}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscriptionLoading ? <Skeleton className="h-8 w-24" /> : `$${subscriptionStats?.monthlyRevenue?.toLocaleString() || 0}`}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                Recurring monthly revenue
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={"/admin/dashboard/subscription-analytics"}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Trial Subscriptions</CardTitle>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {subscriptionLoading ? <Skeleton className="h-8 w-24" /> : subscriptionStats?.trialSubscriptions || 0}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                Currently in trial
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Chart Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>Key metrics across all platform areas</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] p-2">
              {clientsLoading || usersLoading || messagesLoading || subscriptionLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Skeleton className="h-8 w-32 mx-auto mb-2" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
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
                href="/admin/dashboard/subscriptions"
                className="flex items-center justify-between p-3 bg-muted hover:bg-background transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">Subscriptions</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                href="/admin/dashboard/analytics"
                className="flex items-center justify-between p-3 bg-muted hover:bg-background transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5" />
                  <span className="font-medium">Analytics Dashboard</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                href="/admin/dashboard/subscription-analytics"
                className="flex items-center justify-between p-3 bg-muted hover:bg-background transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5" />
                  <span className="font-medium">Subscription Analytics</span>
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
