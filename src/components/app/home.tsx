"use client";
/* eslint-disable */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Skeleton } from "../ui/skeleton";

// The `useMessages` hook is no longer needed here, so we can remove it.

interface Website {
  id: string;
  name: string;
  domain: string;
  phone: string;
  userId: string;
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
  const siteCount = websites ? websites.length : 0;

  const { data: session, isPending } = useSession();
  const fullName = session?.user?.name?.trim() || "Guest";
  const firstName = fullName.split(" ")[0];

  // 3. The `useMessages` hook and all its related logic are GONE.
  //    This makes the component lighter and faster.

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
            Here’s a quick overview of your activity.
          </p>
        </div>
        <Link href="/app/build">
          <Button className="text-foreground">
            <Plus className="mr-2 h-4 w-4 text-foreground" />
            New Site
          </Button>
        </Link>
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
      </div>
    </div>
  );
}