import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "../api/adminStatsApi";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => getAdminStats(),
    staleTime: 60_000,
  });
}
