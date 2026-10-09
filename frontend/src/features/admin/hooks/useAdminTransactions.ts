import { useQuery } from "@tanstack/react-query";
import { getAdminTransactions } from "../api/adminTransactionsApi";

export function useAdminTransactions({
  page,
  size = 10,
}: {
  page: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ["admin-transactions", page, size],
    queryFn: () => getAdminTransactions({ page, size }),
  });
}
