// app/admin/dashboard/layout.tsx
/* eslint-disable */

import { ReactNode } from "react";
import ClientDashboardLayout from "./admin-layout";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

  if (!session?.user) {
    return redirect("/admin");
  }

  if (session.user.role === "admin") {
    return (
      <ClientDashboardLayout session={session}>
        {children}
      </ClientDashboardLayout>
    );
  }

  // Teammate/worker: allow login from admin page but redirect to worker dashboard
  const worker = await prisma.worker.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (worker) {
    return redirect("/worker/dashboard");
  }

  return redirect("/not-authorized");
}
