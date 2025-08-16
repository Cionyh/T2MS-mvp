/* eslint-disable */

import { ReactNode } from "react";
import ClientDashboardLayout from "./admin-layout";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


export const metadata = {
  title: "Admin | T2MS",
  description: "Admin Dashboard for T2MS",
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
const session = await auth.api.getSession({
    headers: await headers(),
  });

    return <ClientDashboardLayout session={session}>{children}</ClientDashboardLayout>;
}
