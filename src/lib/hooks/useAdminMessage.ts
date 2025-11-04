import { useQuery } from "@tanstack/react-query";

/* ------------------ TYPES ------------------ */
export interface Message {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  client: {
    id: string;
    name: string;
    domain: string;
    organizationId?: string | null;
    user: {
      id: string;
      name: string;
      email: string;
    } | null;
  };
}

export interface MessagesResponse {
  data: Message[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface UseAdminMessagesOptions {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
  enabled?: boolean;
}

/* ------------------ FETCH MESSAGES ------------------ */
export const useAdminMessages = ({
  page = 1,
  limit = 10,
  search = "",
  clientId,
  enabled = true,
}: UseAdminMessagesOptions) => {
  return useQuery<MessagesResponse, Error>({
    queryKey: ["adminMessages", page, limit, search, clientId],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        q: search,
      });

      if (clientId) params.append("clientId", clientId);

      const res = await fetch(`/api/admin/messages?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled,
    staleTime: 5000,
  });
};
