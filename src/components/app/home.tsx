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
import { Plus, BarChart3, Wrench, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { getHostedPageDomain } from "@/lib/hosted-page/constants";
import { Skeleton } from "../ui/skeleton";

// The `useMessages` hook is no longer needed here, so we can remove it.

interface Website {
  id: string;
  name: string;
  domain: string;
  organizationId: string | null;
  hostedSlug?: string | null;
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

  const hostedSite = websites?.find((site) => site.hostedSlug?.trim()) ?? null;
  const hostedSlug = hostedSite?.hostedSlug?.trim() ?? "";
  const hostedUrl = hostedSlug
    ? `https://${hostedSlug}.${getHostedPageDomain()}`
    : null;
  const hostedDisplay = hostedSlug
    ? `${hostedSlug}.${getHostedPageDomain()}`
    : null;

  const handleCopyHostedUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Announcement page link copied");
  };

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

      <Card>
        <CardHeader>
          <CardTitle>I signed up. Now what?</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-none space-y-5 p-0">
            <li className="space-y-2">
              <p className="font-medium text-foreground">
                1. Your announcement page is ready.
              </p>
              <p className="text-sm text-muted-foreground">
                You can share your T2MS announcement-page link immediately. No
                website installation is required.
              </p>
              {hostedUrl && hostedDisplay ? (
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={hostedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-amber-800 dark:text-amber-300 hover:underline break-all"
                  >
                    {hostedDisplay}
                  </a>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-foreground"
                    onClick={() => handleCopyHostedUrl(hostedUrl)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy link
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-foreground"
                    asChild
                  >
                    <a
                      href={hostedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </a>
                  </Button>
                </div>
              ) : (
                <p className="text-sm">
                  <Link
                    href="/app/sites"
                    className="font-medium text-foreground underline underline-offset-4"
                  >
                    Go to Sites
                  </Link>{" "}
                  <span className="text-muted-foreground">
                    to set your announcement-page link.
                  </span>
                </p>
              )}
            </li>
            <li className="space-y-1">
              <p className="font-medium text-foreground">
                2. Send your first announcement.
              </p>
              <p className="text-sm text-muted-foreground">
                Text your announcement from your verified phone number to the
                T2MS number. Your update will appear automatically.
              </p>
            </li>
            <li className="space-y-1">
              <p className="font-medium text-foreground">
                3. Want announcements on your existing website too?
              </p>
              <p className="text-sm text-muted-foreground">
                Add your website domain and get the T2MS widget installed.
              </p>
              <p className="text-sm">
                <Link
                  href="/app/sites"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  Go to Sites
                </Link>
                <span className="text-muted-foreground"> or </span>
                <Link
                  href="/app/install-request"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  Get Widget Installed
                </Link>
              </p>
            </li>
            <li className="space-y-1">
              <p className="font-medium text-foreground">
                4. Want to customize your announcement page?
              </p>
              <p className="text-sm text-muted-foreground">
                Go to{" "}
                <Link
                  href="/app/sites"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  Sites → Announcement Page
                </Link>{" "}
                anytime to add your logo, background, images, video, intro or
                footer.
              </p>
            </li>
          </ol>
        </CardContent>
      </Card>

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