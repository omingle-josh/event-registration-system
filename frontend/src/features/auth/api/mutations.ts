import { useMutation } from "@tanstack/react-query";
import { login, register } from "./authApi";
import { LoginRequestDto, RegisterRequestDto } from "../types";

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
