import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminOrganizers,
  getAdminRegistrants,
  createAdminUser,
  type CreateUserRequestDto,
} from "../api/adminUsersApi";

export function useAdminOrganizers() {
  return useQuery({
    queryKey: ["admin-organizers"],
    queryFn: () => getAdminOrganizers(),
  });
}

export function useAdminRegistrants() {
  return useQuery({
    queryKey: ["admin-registrants"],
    queryFn: () => getAdminRegistrants(),
  });
}

export function useCreateAdminOrganizer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: Omit<CreateUserRequestDto, "role">) =>
      createAdminUser({ request: { ...request, role: "ORGANIZER" } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-organizers"] });
    },
  });
}

export function useCreateAdminRegistrant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: Omit<CreateUserRequestDto, "role">) =>
      createAdminUser({ request: { ...request, role: "REGISTRANT" } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-registrants"] });
    },
  });
}

