/* eslint-disable */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import DashboardClient from "@/components/app/sites"; 

interface Website {
  id: string;
  name: string;
  domain: string;
  phone: string;
  userId: string;
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  let websites: Website[] = [];

  if (userId) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/client?userId=${userId}`, {
        cache: 'no-store' // Prevent caching, ensure fresh data
      });

      if (!res.ok) {
        console.error("Failed to fetch websites:", res.status, res.statusText);
        // Handle the error gracefully, maybe show a message
      } else {
        websites = await res.json();
      }
    } catch (error: any) {
      console.error("Error fetching websites:", error);
      // Handle the error gracefully
    }
  }

  return (
    <DashboardClient initialWebsites={websites} />
  );
}


