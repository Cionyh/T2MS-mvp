import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface MessagesResponse {
  data: Message[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UseMessagesOptions {
  page?: number;
  limit?: number;
  search?: string;
  userId: string;
  enabled?: boolean;
}

/* ------------------ FETCH MESSAGES ------------------ */
export const useMessages = ({
  page = 1,
  limit = 10,
  search = "",
  userId,
  enabled = true,
}: UseMessagesOptions) => {
  return useQuery<MessagesResponse, Error>({
    queryKey: ["messages", userId, page, limit, search],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        userId,
      });
      if (search) params.append("q", search);

      const res = await fetch(`/api/messages?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch messages");

      return res.json();
    },
    enabled: enabled && !!userId,
    staleTime: 5000,
  });
};

/* ------------------ DELETE MESSAGE ------------------ */
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (messageId: string) => {
      const res = await fetch(`/api/messages/${messageId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete message");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"], exact: false });
    },
  });
};
