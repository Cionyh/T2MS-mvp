/* eslint-disable */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ClientDashboardPage from "@/components/app/home";

// 1. Import both query functions
import { getWebsitesByUserId } from "@/lib/queries/getWebsites";
import { getMessageCountByUserId } from "@/lib/queries/getMessages";

// The Website interface can stay the same
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

  // 2. Secure the page: redirect if the user is not logged in.
  if (!userId) {
    redirect("/sign-in"); // Adjust this to your sign-in page URL
  }

  // 3. Fetch all necessary data in parallel now that we know userId is valid.
  //    This is more efficient than fetching one after the other.
  const [websites, messageCount] = await Promise.all([
    getWebsitesByUserId(userId),
    getMessageCountByUserId(userId),
  ]);

  // 4. Pass all the pre-fetched data, including the CORRECT userId, to the client component.
  return (
    <ClientDashboardPage
      websites={websites}
      userId={userId}
      initialMessageCount={messageCount}
    />
  );
}