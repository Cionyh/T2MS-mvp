"use client";
/* eslint-disable */

import { useState, useEffect } from "react";
import Link from "next/link";

// ** Shadcn Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ** Lucide React Icons
import {
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";

// ** Recharts
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface Website {
  id: string;
  name: string;
  domain: string;
  phone: string;
  userId: string;
}

interface Props {
  websites?: Website[];
}

// ** Dummy Analytics Data
const usersData = [
  { name: "Mon", value: 20 },
  { name: "Tue", value: 35 },
  { name: "Wed", value: 30 },
  { name: "Thu", value: 50 },
  { name: "Fri", value: 45 },
  { name: "Sat", value: 60 },
  { name: "Sun", value: 55 },
];

const messagesData = [
  { name: "Mon", value: 5 },
  { name: "Tue", value: 15 },
  { name: "Wed", value: 10 },
  { name: "Thu", value: 25 },
  { name: "Fri", value: 20 },
  { name: "Sat", value: 30 },
  { name: "Sun", value: 25 },
];

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

export default function DashboardPage({ websites }: Readonly<Props>) {
  const [siteCount, setSiteCount] = useState<number>(0);

  return (
    <div className="space-y-4 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Welcome back,
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
            <div className="text-2xl font-bold">{siteCount}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              +2 since last month
            </p>
          </CardContent>
        </Card>

        </Link>

        <Link href={"/admin/dashboard/clients"}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              +15.2% from last month
            </p>
          </CardContent>
        </Card>
        </Link>

        <Link href={"/admin/dashboard/messages"}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Messages Received
            </CardTitle>
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              -5.1% from last month
            </p>
          </CardContent>
        </Card>
        </Link>

        <Link href={"/admin/dashboard/analytics"}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Analytics
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+18%</div>
            <p className="text-xs text-muted-foreground">
              Growth this quarter
            </p>
          </CardContent>
        </Card>
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clients Growth</CardTitle>
              <CardDescription>
                Weekly new client registrations
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usersData}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#12970dff"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#12970dff"
                        stopOpacity={0}
                      />
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

        {/* Quick Links/Actions Section */}
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