// app/admin/dashboard/layout.tsx
/* eslint-disable */

import { ReactNode } from "react";
import ClientDashboardLayout from "./admin-layout";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin | T2MS",
  description: "Admin Dashboard for T2MS",
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    // Redirect non-admins or unauthenticated users to login or not-authorized page
    return redirect("/not-authorized");
  }

  return (
    <ClientDashboardLayout session={session}>
      {children}
    </ClientDashboardLayout>
  );
}
