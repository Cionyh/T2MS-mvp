import { useQuery } from "@tanstack/react-query";

/**
 * Total count of client users only (excludes admins and workers/team members).
 * Fetches from analytics overview so the number matches the rest of the dashboard.
 */
export function useTotalUsers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["totalUsers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/overview?days=1");
      if (!res.ok) return 0;
      const json = await res.json();
      return json?.overview?.totalUsers ?? 0;
    },
  });

  return {
    total: typeof data === "number" ? data : 0,
    isLoading,
    error,
  };
}
