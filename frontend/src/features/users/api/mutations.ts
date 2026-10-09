import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMyProfile } from "../../auth/api/userApi"; // Note: userApi is still in auth/api, we should probably move it to users/api later
import { createAdminUser } from "../../admin/api/adminUsersApi";
import { UpdateProfileRequestDto, CreateUserRequestDto } from "../types";

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ request }: { request: UpdateProfileRequestDto }) =>
      updateMyProfile({ request }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ request }: { request: CreateUserRequestDto }) =>
      createAdminUser({ request }),
    onSuccess: () => {
      // Invalidate both organizers and registrants just in case
      void queryClient.invalidateQueries({ queryKey: ["admin-organizers"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-registrants"] });
    },
  });
}
