"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { prisma } from "@/lib/prisma";

export interface Subscription {
  id: string;
  plan: string;
  referenceId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: string | null;
  periodStart: Date | null;
  periodEnd: Date | null;
  trialStart: Date | null;
  trialEnd: Date | null;
  cancelAtPeriodEnd: boolean | null;
  seats: number | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  cancelledSubscriptions: number;
  monthlyRevenue: number;
  annualRevenue: number;
  averageSeats: number;
  planDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
}

export interface SubscriptionsResponse {
  data: Subscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function useAdminSubscriptions({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  plan = "",
  enabled = true,
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  plan?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["admin-subscriptions", page, limit, search, status, plan],
    queryFn: async (): Promise<SubscriptionsResponse> => {
      const response = await fetch(
        `/api/admin/subscriptions?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${status}&plan=${plan}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }
      return response.json();
    },
    enabled,
  });
}

export function useSubscriptionStats() {
  return useQuery({
    queryKey: ["subscription-stats"],
    queryFn: async (): Promise<SubscriptionStats> => {
      const response = await fetch("/api/admin/subscriptions/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription stats");
      }
      return response.json();
    },
  });
}

export function useSubscriptionCharts() {
  return useQuery({
    queryKey: ["subscription-charts"],
    queryFn: async () => {
      const response = await fetch("/api/admin/subscriptions/charts");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription charts data");
      }
      return response.json();
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Subscription> }) => {
      const response = await fetch(`/api/admin/subscriptions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update subscription");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-stats"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-charts"] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/subscriptions/${id}/cancel`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-stats"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-charts"] });
    },
  });
}
