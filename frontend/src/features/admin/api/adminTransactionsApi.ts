import apiClient from "../../../api/axios";
import type { AdminTransactionDto } from "../types/types";
import type { PageResponse } from "../../events/api/eventsApi";

export async function getAdminTransactions({
  page = 0,
  size = 10,
}: {
  page?: number;
  size?: number;
}): Promise<PageResponse<AdminTransactionDto>> {
  const response = await apiClient.get<PageResponse<AdminTransactionDto>>("/registrations/admin/transactions", {
    params: { page, size },
  });
  return response.data;
}
