// lib/hooks/useAdminClients.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Client {
  id: string;
  name: string;
  domain: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string | null;
  };
  _count: {
    messages: number;
  };
}

export interface ClientsResponse {
  data: Client[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UseAdminClientsOptions {
  page?: number;
  limit?: number;
  search?: string;
  enabled?: boolean;
}

/* ------------------ FETCH CLIENTS ------------------ */
export const useAdminClients = ({
  page = 1,
  limit = 10,
  search = "",
  enabled = true,
}: UseAdminClientsOptions) => {
  return useQuery<ClientsResponse, Error>({
    queryKey: ["adminClients", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        q: search,
      });

      const res = await fetch(`/api/admin/clients?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
    enabled,
    staleTime: 5000,
  });
};

/* ------------------ DELETE CLIENT ------------------ */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    string // clientId
  >({
    mutationFn: async (clientId: string) => {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete client");
    },
    onSuccess: (_, clientId) => {
      // Invalidate clients queries to refresh table
      queryClient.invalidateQueries({ queryKey: ["adminClients"] });
    },
  });
};

/* ------------------ UPDATE CLIENT ------------------ */
interface UpdateClientInput {
  id: string;
  name: string;
  domain: string;
  phone: string;
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Client,
    Error,
    UpdateClientInput
  >({
    mutationFn: async ({ id, name, domain, phone }) => {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain, phone }),
      });
      if (!res.ok) throw new Error("Failed to update client");
      return res.json();
    },
    onSuccess: () => {
      // Refresh clients list
      queryClient.invalidateQueries({ queryKey: ["adminClients"] });
    },
  });
};
