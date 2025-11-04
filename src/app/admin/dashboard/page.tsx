/* eslint-disable */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ClientDashboardPage from "@/components/admin/home";

export default async function DashboardServerPage() {  
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Admin dashboard - no need to fetch websites here if not used
  // If admin needs to see all websites, they can fetch via API routes

  return <ClientDashboardPage />; 
}