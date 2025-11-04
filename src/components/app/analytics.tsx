"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Globe,
  Activity,
  Calendar,
  Clock,
  Users,
} from "lucide-react";
import { useUserAnalytics } from "@/lib/hooks/useUserAnalytics";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface AnalyticsProps {}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"];

export default function AnalyticsPage({}: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState("30");
  const { data: session } = useSession();
  const { data: analytics, isLoading, error } = useUserAnalytics(parseInt(timeRange));

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-destructive">Error Loading Analytics</h2>
          <p className="text-muted-foreground mt-2">
            There was an error loading your analytics data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const fullName = session?.user?.name?.trim() || "Guest";
  const firstName = fullName.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Insights and performance metrics for your sites and messages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : analytics?.overview.totalSites || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active websites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : analytics?.overview.totalMessages || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              All time messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : analytics?.overview.messagesThisWeek || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Messages sent this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : analytics?.overview.messagesThisMonth || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Messages sent this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Message Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Message Trends</CardTitle>
            <CardDescription>
              Daily message activity over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.messageTrends.daily || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: "#8884d8" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Site Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Site Performance</CardTitle>
            <CardDescription>
              Message count by site
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.siteStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messageCount" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Site Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Site Statistics</CardTitle>
          <CardDescription>
            Detailed performance metrics for each of your sites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {analytics?.siteStats.map((site) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <h3 className="font-medium">{site.name}</h3>
                    <p className="text-sm text-muted-foreground">{site.domain}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {site.lastMessageDate
                        ? `Last message: ${new Date(site.lastMessageDate).toLocaleDateString()}`
                        : "No messages yet"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{site.messageCount}</div>
                    <p className="text-sm text-muted-foreground">messages</p>
                  </div>
                </div>
              ))}
              {analytics?.siteStats.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No sites found. Create your first site to see analytics.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest messages and site updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {analytics?.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {activity.type === "message" ? (
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Globe className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {activity.type === "message" ? "New message" : "Site created"}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {activity.siteName}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.type === "message" 
                        ? activity.content.length > 100 
                          ? `${activity.content.substring(0, 100)}...`
                          : activity.content
                        : `${activity.siteDomain}`
                      }
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {analytics?.recentActivity.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity to show.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
