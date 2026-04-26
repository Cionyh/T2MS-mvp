import { useQuery } from "@tanstack/react-query";

export interface AffiliateInboundSmsRow {
  id: string;
  fromPhone: string;
  toPhone: string;
  body: string;
  createdAt: string;
}

export interface AffiliateInboundSmsResponse {
  data: AffiliateInboundSmsRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface Options {
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useAffiliateInboundSms({
  page = 1,
  limit = 20,
  enabled = true,
}: Options) {
  return useQuery<AffiliateInboundSmsResponse, Error>({
    queryKey: ["adminAffiliateInboundSms", page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      const res = await fetch(`/api/admin/affiliate-sms?${params}`);
      if (!res.ok) throw new Error("Failed to fetch affiliate SMS");
      return res.json();
    },
    enabled,
    staleTime: 5000,
  });
}
