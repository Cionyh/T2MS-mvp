import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { bucketTrendsByLocalTime } from "@/lib/analytics-local-trends";

// Types for user analytics
export interface UserAnalyticsData {
  overview: {
    totalSites: number;
    totalMessages: number;
    messagesThisWeek: number;
    messagesThisMonth: number;
    averageMessagesPerSite: number;
  };
  siteStats: Array<{
    id: string;
    name: string;
    domain: string;
    hostedSlug?: string | null;
    displayLabel: string;
    messageCount: number;
    lastMessageDate: string | null;
    createdAt: string;
  }>;
  messageTrends: {
    timestamps?: string[];
    daily: Array<{ date: string; count: number }>;
    weekly: Array<{ week: string; count: number }>;
    monthly: Array<{ month: string; count: number }>;
  };
  recentActivity: Array<{
    id: string;
    type: "message" | "site_created" | "site_updated";
    content: string;
    siteName: string;
    siteDomain: string;
    createdAt: string;
  }>;
}

export function useUserAnalytics(days: number = 30) {
  const query = useQuery<UserAnalyticsData>({
    queryKey: ["user-analytics", days],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/user?days=${days}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user analytics");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const localTrends = useMemo(() => {
    const timestamps = query.data?.messageTrends?.timestamps;
    if (timestamps && timestamps.length > 0) {
      return bucketTrendsByLocalTime(timestamps);
    }
    return (
      query.data?.messageTrends ?? {
        daily: [],
        weekly: [],
        monthly: [],
      }
    );
  }, [query.data?.messageTrends]);

  const data = query.data
    ? {
        ...query.data,
        messageTrends: {
          ...query.data.messageTrends,
          ...localTrends,
        },
      }
    : undefined;

  return {
    ...query,
    data,
  };
}

export function useUserSiteAnalytics(siteId?: string) {
  return useQuery({
    queryKey: ["user-site-analytics", siteId],
    queryFn: async () => {
      const url = siteId
        ? `/api/analytics/site?siteId=${siteId}`
        : `/api/analytics/sites`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch site analytics");
      }
      return response.json();
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });
}
