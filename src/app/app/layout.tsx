/* eslint-disable */

import { ReactNode } from "react";
import ClientDashboardLayout from "./client-layout";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


export const metadata = {
  title: "Dashboard | T2MS",
  description: "Manage your site content, messages, and settings.",
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
const session = await auth.api.getSession({
    headers: await headers(),
  });

    return <ClientDashboardLayout session={session}>{children}</ClientDashboardLayout>;
}
