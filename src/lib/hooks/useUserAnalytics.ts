import { useQuery } from "@tanstack/react-query";

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
    messageCount: number;
    lastMessageDate: string | null;
    createdAt: string;
  }>;
  messageTrends: {
    daily: Array<{ date: string; count: number }>;
    weekly: Array<{ week: string; count: number }>;
    monthly: Array<{ month: string; count: number }>;
  };
  recentActivity: Array<{
    id: string;
    type: 'message' | 'site_created' | 'site_updated';
    content: string;
    siteName: string;
    siteDomain: string;
    createdAt: string;
  }>;
}

export function useUserAnalytics(userId: string, days: number = 30) {
  return useQuery<UserAnalyticsData>({
    queryKey: ["user-analytics", userId, days],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/user?userId=${userId}&days=${days}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user analytics");
      }
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useUserSiteAnalytics(userId: string, siteId?: string) {
  return useQuery({
    queryKey: ["user-site-analytics", userId, siteId],
    queryFn: async () => {
      const url = siteId 
        ? `/api/analytics/site?userId=${userId}&siteId=${siteId}`
        : `/api/analytics/sites?userId=${userId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch site analytics");
      }
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
