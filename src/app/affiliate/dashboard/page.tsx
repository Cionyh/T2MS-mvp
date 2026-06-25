"use client";

import { useSession } from "@/lib/auth-client";

export default function AffiliateDashboardPage() {
  const { data: session } = useSession();
  const fullName = session?.user?.name?.trim() || "Affiliate";
  const firstName = fullName.split(" ")[0];

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {firstName}</h1>
        <p className="text-muted-foreground">Affiliate dashboard</p>
      </div>
    </div>
  );
}
