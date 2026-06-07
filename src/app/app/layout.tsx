/* eslint-disable */

import { ReactNode } from "react";
import ClientDashboardLayout from "./client-layout";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard | T2MS",
  description: "Manage your site content, messages, and settings.",
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Admins must never see the customer app shell — unless impersonating a user
  if (session?.user?.role === "admin" && !session?.session?.impersonatedBy) {
    redirect("/admin/dashboard");
  }

  return <ClientDashboardLayout session={session}>{children}</ClientDashboardLayout>;
}
