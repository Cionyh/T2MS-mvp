import { useQuery } from "@tanstack/react-query";

// Types
export interface AnalyticsOverview {
  overview: {
    totalUsers: number;
    newUsers: number;
    totalClients: number;
    newClients: number;
    totalMessages: number;
    newMessages: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    annualRevenue: number;
  };
  growth: {
    users: number;
    clients: number;
    messages: number;
  };
  charts: {
    userGrowth: Array<{ date: string; users: number }>;
    clientGrowth: Array<{ date: string; clients: number }>;
    messageGrowth: Array<{ date: string; messages: number }>;
  };
}

export interface UserAnalytics {
  metrics: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    bannedUsers: number;
    retentionRate: number;
  };
  distribution: {
    roles: Record<string, number>;
  };
  trends: {
    registration: Array<{ date: string; count: number }>;
  };
  topUsers: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
    _count: { clients: number };
  }>;
}

export interface ClientAnalytics {
  metrics: {
    totalClients: number;
    newClients: number;
    activeClients: number;
    pinnedClients: number;
  };
  distribution: {
    widgetTypes: Record<string, number>;
    domains: Record<string, number>;
  };
  trends: {
    growth: Array<{ date: string; count: number }>;
  };
  topClients: Array<{
    id: string;
    name: string;
    domain: string;
    createdAt: string;
    _count: { messages: number };
    user: { name: string; email: string };
  }>;
}

export interface MessageAnalytics {
  metrics: {
    totalMessages: number;
    newMessages: number;
    messagesToday: number;
    messagesThisWeek: number;
    messagesThisMonth: number;
    averageLength: number;
    growthRate: number;
  };
  trends: {
    daily: Array<{ date: string; count: number }>;
    peakHour: { hour: string; count: number } | null;
  };
  topClients: Array<{
    id: string;
    name: string;
    domain: string;
    _count: { messages: number };
    user: { name: string; email: string };
  }>;
  hourlyDistribution: Record<number, number>;
}

// Hooks
export function useAnalyticsOverview(days: number = 30) {
  return useQuery<AnalyticsOverview>({
    queryKey: ["analytics-overview", days],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/overview?days=${days}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics overview");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useUserAnalytics(days: number = 30) {
  return useQuery<UserAnalytics>({
    queryKey: ["user-analytics", days],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/users?days=${days}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user analytics");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useClientAnalytics(days: number = 30) {
  return useQuery<ClientAnalytics>({
    queryKey: ["client-analytics", days],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/clients?days=${days}`);
      if (!response.ok) {
        throw new Error("Failed to fetch client analytics");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMessageAnalytics(days: number = 30) {
  return useQuery<MessageAnalytics>({
    queryKey: ["message-analytics", days],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/messages?days=${days}`);
      if (!response.ok) {
        throw new Error("Failed to fetch message analytics");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
