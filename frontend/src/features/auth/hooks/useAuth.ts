import { useMutation } from "@tanstack/react-query";
import { login, register, type LoginRequestDto, type RegisterRequestDto } from "../api/authApi";

export function useLogin() {
  return useMutation({
    mutationFn: (request: LoginRequestDto) => login(request),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (request: RegisterRequestDto) => register(request),
  });
}
