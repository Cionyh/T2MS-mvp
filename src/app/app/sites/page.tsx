/* eslint-disable */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import DashboardClient from "@/components/app/sites"; 

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  return <DashboardClient userId={userId} />;
}
