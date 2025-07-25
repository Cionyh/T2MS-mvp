/* eslint-disable */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import DashboardClient from "@/components/app/sites"; 
import { getWebsitesByUserId } from "@/lib/queries/getWebsites";


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
    websites = await getWebsitesByUserId(userId);
  }

  return <DashboardClient initialWebsites={websites} />;
}
