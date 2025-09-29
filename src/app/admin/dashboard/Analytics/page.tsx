"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Globe, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { useAnalyticsOverview, useUserAnalytics, useClientAnalytics, useMessageAnalytics } from "@/lib/hooks/useAnalytics";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Color palettes for charts
const COLORS = {
  primary: "#8884d8",
  secondary: "#82ca9d", 
  accent: "#ffc658",
  warning: "#ff7300",
  success: "#00c851",
  info: "#33b5e5",
  danger: "#ff4444"
};

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.warning, COLORS.success, COLORS.info];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-background border rounded-lg shadow-lg">
        <p className="font-semibold text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Metric card component
const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  description,
  loading = false 
}: {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon: any;
  description?: string;
  loading?: boolean;
}) => {
  const getChangeColor = () => {
    if (changeType === "increase") return "text-green-600";
    if (changeType === "decrease") return "text-red-600";
    return "text-muted-foreground";
  };

  const getChangeIcon = () => {
    if (changeType === "increase") return <TrendingUp className="h-4 w-4" />;
    if (changeType === "decrease") return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? <Skeleton className="h-8 w-24" /> : value}
        </div>
        {change !== undefined && !loading && (
          <div className={cn("flex items-center text-xs", getChangeColor())}>
            {getChangeIcon()}
            <span className="ml-1">{Math.abs(change)}%</span>
            <span className="ml-1 text-muted-foreground">vs last period</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch analytics data
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useAnalyticsOverview(parseInt(timeRange));
  const { data: userAnalytics, isLoading: userLoading } = useUserAnalytics(parseInt(timeRange));
  const { data: clientAnalytics, isLoading: clientLoading } = useClientAnalytics(parseInt(timeRange));
  const { data: messageAnalytics, isLoading: messageLoading } = useMessageAnalytics(parseInt(timeRange));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchOverview(),
    ]);
    setIsRefreshing(false);
  };

  // Process chart data
  const userGrowthData = useMemo(() => {
    if (!overview?.charts?.userGrowth) return [];
    return overview.charts.userGrowth.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      users: item.users
    }));
  }, [overview]);

  const clientGrowthData = useMemo(() => {
    if (!overview?.charts?.clientGrowth) return [];
    return overview.charts.clientGrowth.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      clients: item.clients
    }));
  }, [overview]);

  const messageGrowthData = useMemo(() => {
    if (!overview?.charts?.messageGrowth) return [];
    return overview.charts.messageGrowth.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      messages: item.messages
    }));
  }, [overview]);

  const combinedGrowthData = useMemo(() => {
    const data: Record<string, any> = {};
    
    userGrowthData.forEach(item => {
      if (!data[item.date]) data[item.date] = { date: item.date };
      data[item.date].users = item.users;
    });
    
    clientGrowthData.forEach(item => {
      if (!data[item.date]) data[item.date] = { date: item.date };
      data[item.date].clients = item.clients;
    });
    
    messageGrowthData.forEach(item => {
      if (!data[item.date]) data[item.date] = { date: item.date };
      data[item.date].messages = item.messages;
    });
    
    return Object.values(data).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [userGrowthData, clientGrowthData, messageGrowthData]);

  // Widget type distribution data
  const widgetTypeData = useMemo(() => {
    if (!clientAnalytics?.distribution?.widgetTypes) return [];
    return Object.entries(clientAnalytics.distribution.widgetTypes).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: CHART_COLORS[Object.keys(clientAnalytics.distribution.widgetTypes).indexOf(name) % CHART_COLORS.length]
    }));
  }, [clientAnalytics]);

  // Role distribution data
  const roleDistributionData = useMemo(() => {
    if (!userAnalytics?.distribution?.roles || Object.keys(userAnalytics.distribution.roles).length === 0) {
      return [
        { name: "User", value: 1, color: CHART_COLORS[0] },
        { name: "Admin", value: 0, color: CHART_COLORS[1] }
      ];
    }
    return Object.entries(userAnalytics.distribution.roles).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: CHART_COLORS[Object.keys(userAnalytics.distribution.roles).indexOf(name) % CHART_COLORS.length]
    }));
  }, [userAnalytics]);

  return (
    <div className="space-y-6 p-6 relative">
      <DotPattern
        className={cn(
          "-z-50",
          "[mask-image:radial-gradient(10000px_circle_at_center,white,transparent)]"
        )}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your Text2MySite™ platform performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={overview?.overview?.totalUsers?.toLocaleString() || 0}
          change={overview?.growth?.users ? Math.round(overview.growth.users * 100) / 100 : undefined}
          changeType={overview?.growth?.users && overview.growth.users > 0 ? "increase" : "neutral"}
          icon={Users}
          description="Registered users"
          loading={overviewLoading}
        />
        <MetricCard
          title="Total Sites"
          value={overview?.overview?.totalClients?.toLocaleString() || 0}
          change={overview?.growth?.clients ? Math.round(overview.growth.clients * 100) / 100 : undefined}
          changeType={overview?.growth?.clients && overview.growth.clients > 0 ? "increase" : "neutral"}
          icon={Globe}
          description="Registered websites"
          loading={overviewLoading}
        />
        <MetricCard
          title="Messages Sent"
          value={overview?.overview?.totalMessages?.toLocaleString() || 0}
          change={overview?.growth?.messages ? Math.round(overview.growth.messages * 100) / 100 : undefined}
          changeType={overview?.growth?.messages && overview.growth.messages > 0 ? "increase" : "neutral"}
          icon={MessageSquare}
          description="Total messages delivered"
          loading={overviewLoading}
        />
        <MetricCard
          title="Monthly Revenue"
          value={`$${overview?.overview?.monthlyRevenue?.toLocaleString() || 0}`}
          icon={DollarSign}
          description="Recurring monthly revenue"
          loading={overviewLoading}
        />
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="clients">Websites</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Growth Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Trends</CardTitle>
                <CardDescription>User, website, and message growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {overviewLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={combinedGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="users"
                          stackId="1"
                          stroke={COLORS.primary}
                          fill={COLORS.primary}
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="clients"
                          stackId="2"
                          stroke={COLORS.secondary}
                          fill={COLORS.secondary}
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="messages"
                          stackId="3"
                          stroke={COLORS.accent}
                          fill={COLORS.accent}
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Active Subscriptions</span>
                  </div>
                  <Badge variant="secondary">
                    {overview?.overview?.activeSubscriptions || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">New This Period</span>
                  </div>
                  <Badge variant="outline">
                    {overview?.overview?.newUsers || 0} clients
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">New Sites</span>
                  </div>
                  <Badge variant="outline">
                    {overview?.overview?.newClients || 0} sites
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Messages Today</span>
                  </div>
                  <Badge variant="outline">
                    {messageAnalytics?.metrics?.messagesToday || 0}
                  </Badge>
                </div>
                <div className="pt-4 border-t">
                  <Link href="/admin/dashboard/subscription-analytics">
                    <Button variant="outline" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Detailed Subscription Analytics
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>User roles and activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {userLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={roleDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }: any) => `${name} ${((value / roleDistributionData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {roleDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Metrics</CardTitle>
                <CardDescription>Key user statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {userLoading ? <Skeleton className="h-8 w-16 mx-auto" /> : (userAnalytics?.metrics?.totalUsers || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {userLoading ? <Skeleton className="h-8 w-16 mx-auto" /> : (userAnalytics?.metrics?.activeUsers || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {userLoading ? <Skeleton className="h-8 w-16 mx-auto" /> : (userAnalytics?.metrics?.newUsers || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">New Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {userLoading ? <Skeleton className="h-8 w-16 mx-auto" /> : (userAnalytics?.metrics?.bannedUsers || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Banned Users</div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {userLoading ? <Skeleton className="h-8 w-16 mx-auto" /> : `${userAnalytics?.metrics?.retentionRate || 0}%`}
                    </div>
                    <div className="text-sm text-muted-foreground">Retention Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Widget Type Distribution</CardTitle>
                <CardDescription>Most popular widget types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {clientLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={widgetTypeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill={COLORS.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Metrics</CardTitle>
                <CardDescription>Website registration statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{clientAnalytics?.metrics?.totalClients || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Sites</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{clientAnalytics?.metrics?.activeClients || 0}</div>
                    <div className="text-sm text-muted-foreground">Active Sites</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{clientAnalytics?.metrics?.newClients || 0}</div>
                    <div className="text-sm text-muted-foreground">New Sites</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{clientAnalytics?.metrics?.pinnedClients || 0}</div>
                    <div className="text-sm text-muted-foreground">Pinned Sites</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Message Activity</CardTitle>
                <CardDescription>Daily message volume trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {messageLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={messageGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="messages" 
                          stroke={COLORS.accent} 
                          strokeWidth={2}
                          dot={{ fill: COLORS.accent, strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Message Metrics</CardTitle>
                <CardDescription>Communication statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{messageAnalytics?.metrics?.totalMessages || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Messages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{messageAnalytics?.metrics?.messagesToday || 0}</div>
                    <div className="text-sm text-muted-foreground">Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{messageAnalytics?.metrics?.messagesThisWeek || 0}</div>
                    <div className="text-sm text-muted-foreground">This Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{messageAnalytics?.metrics?.averageLength || 0}</div>
                    <div className="text-sm text-muted-foreground">Avg Length</div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {messageAnalytics?.metrics?.growthRate || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Growth Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
