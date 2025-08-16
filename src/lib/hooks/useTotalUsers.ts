import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/auth-client";

export function useTotalUsers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["totalUsers"],
    queryFn: async () => {
      // SDK returns a wrapped object, usually { data, ... }
      const response = await client.admin.listUsers({
        query: { limit: 1 }, // we just need total
      });

      // Access the .data safely
      return response?.data?.total ?? 0;
    },
  });

  return {
    total: typeof data === "number" ? data : 0,
    isLoading,
    error,
  };
}
