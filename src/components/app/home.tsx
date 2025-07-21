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
import { useState, useEffect } from "react";
import Link from "next/link";

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

export default function DashboardPage({ websites }: Readonly<Props>) {  // Kept this component name
  const [siteCount, setSiteCount] = useState<number>(0);

  useEffect(() => {
    setSiteCount(websites ? websites.length : 0);
  }, [websites]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground">
            Here’s a quick overview of your activity.
          </p>
        </div>
        <Link href="app/build">
        <Button className="text-foregound">
          <Plus className="mr-2 h-4 w-4 text-foreground" />
          New Site
        </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
         <Link href="/app/sites">
        <Card  className="hover:bg-background bg-muted transition-colors">
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
      </div>
    </div>
  );
}