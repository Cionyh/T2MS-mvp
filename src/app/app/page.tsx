/* eslint-disable */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ClientDashboardPage from "@/components/app/home";
import { getWebsitesByUserId } from "@/lib/queries/getWebsites";

interface Website {
  id: string;
  name: string;
  domain: string;
  phone: string;
  userId: string;
}

export default async function DashboardServerPage() {  
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  let websites: Website[] = [];

  if (userId) {
    websites = await getWebsitesByUserId(userId);
  }

  return <ClientDashboardPage websites={websites} userId={""} />; 
}