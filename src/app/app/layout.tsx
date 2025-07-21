/* eslint-disable */

import { ReactNode } from "react";
import ClientDashboardLayout from "./client-layout"; 

export const metadata = {
  title: "Dashboard | T2MS",
  description: "Manage your site content, messages, and settings.",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <ClientDashboardLayout>{children}</ClientDashboardLayout>;
}
