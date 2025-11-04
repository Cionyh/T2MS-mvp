/* eslint-disable */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ClientDashboardPage from "@/components/app/home";
import { getActiveOrganization } from "@/lib/organization-helpers";

// 1. Import both query functions
import { getWebsitesByOrganizationId } from "@/lib/queries/getWebsites";
import { getMessageCountByOrganizationId } from "@/lib/queries/getMessages";

export default async function DashboardServerPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  // 2. Secure the page: redirect if the user is not logged in.
  if (!userId) {
    redirect("/sign-in"); // Adjust this to your sign-in page URL
  }

  // 3. Get active organization for the user
  const organizationId = await getActiveOrganization();

  // 4. Fetch all necessary data in parallel based on organization
  const [websites, messageCount] = await Promise.all([
    getWebsitesByOrganizationId(organizationId),
    getMessageCountByOrganizationId(organizationId),
  ]);

  // 5. Pass all the pre-fetched data to the client component.
  return (
    <ClientDashboardPage
      websites={websites}
      userId={userId}
      initialMessageCount={messageCount}
    />
  );
}