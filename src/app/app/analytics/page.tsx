import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import AnalyticsPage from "@/components/app/analytics";

export const metadata = {
  title: "Analytics | T2MS",
  description: "View insights and performance metrics for your sites and messages.",
};

export default async function Analytics() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            You need to be signed in to view analytics.
          </p>
        </div>
      </div>
    );
  }

  return <AnalyticsPage />;
}
