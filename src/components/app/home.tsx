"use client";
/* eslint-disable */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, BarChart3, Wrench, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Skeleton } from "../ui/skeleton";

// The `useMessages` hook is no longer needed here, so we can remove it.

interface Website {
  id: string;
  name: string;
  domain: string;
  organizationId: string | null;
  phoneNumbers: Array<{
    id: string;
    phone: string;
    verified: boolean;
  }>;
}

// 1. UPDATE THE PROPS INTERFACE HERE
interface Props {
  websites?: Website[];
  userId: string;
  initialMessageCount: number; // <-- ADD THIS LINE
}

export default function ClientDashboardPage({
  websites,
  userId,
  initialMessageCount, // <-- Destructure the new prop
}: Readonly<Props>) {
  // 2. The useState and useEffect for siteCount can be removed.
  //    We can calculate it directly from the props.
  const router = useRouter();
  const siteCount = websites ? websites.length : 0;

  const { data: session, isPending } = useSession();
  const fullName = session?.user?.name?.trim() || "Guest";
  const firstName = fullName.split(" ")[0];

  const [installJobCount, setInstallJobCount] = useState<number | null>(null);
  const [registerFirstSiteOpen, setRegisterFirstSiteOpen] = useState(false);
  const [plan, setPlan] = useState<string>("");

  useEffect(() => {
    if (siteCount === 0 && websites !== undefined) {
      setRegisterFirstSiteOpen(true);
    }
  }, [siteCount, websites]);

  useEffect(() => {
    fetch("/api/plan/usage")
      .then((r) => r.json())
      .then((data) => setPlan(data?.plan ?? "free"))
      .catch(() => setPlan("free"));
  }, []);

  const siteLimit = plan === "starter" ? 1 : plan === "pro" ? 3 : undefined;
  const canAddMoreSites = siteLimit === undefined || siteCount < siteLimit;

  useEffect(() => {
    fetch("/api/install-jobs")
      .then((r) => r.json())
      .then((d) => setInstallJobCount(Array.isArray(d.jobs) ? d.jobs.length : 0))
      .catch(() => setInstallJobCount(0));
  }, []);

  // 3. The `useMessages` hook and all its related logic are GONE.
  //    This makes the component lighter and faster.

  return (
    <div className="space-y-6">
      {/* Popup when user has no sites: Register Your first Site */}
      <Dialog open={registerFirstSiteOpen} onOpenChange={setRegisterFirstSiteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register Your first Site</DialogTitle>
            <DialogDescription>
              Get started by registering your first website to add the T2MS widget.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="text-foreground"
              onClick={() => {
                setRegisterFirstSiteOpen(false);
                router.push("/app/build");
              }}
            >
              Register Your first Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Welcome{" "}
            <span className="font-bold">
              {isPending ? (
                <Skeleton className="inline-block h-6 w-24 rounded" />
              ) : (
                firstName
              )}
            </span>
          </h2>
          <p className="text-muted-foreground">
            Here's a quick overview of your activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/configure_widget_settings.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className="text-foreground">
              Widget Settings Guide
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>
          {canAddMoreSites && (
            <Link href="/app/build">
              <Button variant="outline" className="text-foreground">
                <Plus className="mr-2 h-4 w-4" />
                New Site
              </Button>
            </Link>
          )}
          <Link href="/app/install-request">
            <Button className="text-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Get Widget Installed
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Sites Card */}
        <Link href="/app/sites">
          <Card className="hover:bg-background bg-muted transition-colors">
            <CardHeader>
              <CardTitle>Sites</CardTitle>
              <CardDescription>Manage your connected websites</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{siteCount}</p>
              <p className="text-muted-foreground text-sm mt-1">
                Active websites
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Messages Card */}
        <Link href="/app/messages">
          <Card className="hover:bg-background bg-muted transition-colors">
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Messages you have sent</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 4. Display the message count directly from the prop. No more loading state! */}
              <p className="text-3xl font-bold">{initialMessageCount}</p>
              <p className="text-muted-foreground text-sm mt-1">
                Total messages
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Analytics Card */}
        <Link href="/app/analytics">
          <Card className="hover:bg-background bg-muted transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </CardTitle>
              <CardDescription>View insights and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mt-1">
                View detailed analytics
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Widget Install Requests - count and link to list with status */}
        {installJobCount !== null && (
          <Link href="/app/install-requests">
            <Card className="hover:bg-background bg-muted transition-colors border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Widget Install Requests
                </CardTitle>
                <CardDescription>
                  View your install requests and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{installJobCount}</p>
                <p className="text-muted-foreground text-sm mt-1">
                  {installJobCount === 1 ? "install request" : "install requests"}
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}