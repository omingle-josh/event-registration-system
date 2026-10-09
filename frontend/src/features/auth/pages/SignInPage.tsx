import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import { useAppDispatch } from "../../../store/hooks";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/card";

import { useLogin } from "../hooks/useAuth";
import { setSession } from "../../../store/slices/authSlice";
import { ApiError } from "../../../lib/http/httpClient";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import "../styles/google-signin.css";

const SignInSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
  password: z.string().trim().min(1, "Password is required"),
});

type SignInFormValues = z.infer<typeof SignInSchema>;

export function SignInPage() {
  const { mutateAsync: loginMutation, isPending: isSubmitting } = useLogin();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: SignInFormValues) {
    try {
      const result = await loginMutation({ email: data.email, password: data.password });

      // Store refresh token in localStorage (as requested)
      localStorage.setItem("event-registration.refresh-token", result.refreshToken);

      // Update Redux session (accessToken in memory)
      dispatch(setSession({
        accessToken: result.token,
        role: result.role,
        email: result.email
      }));

      toast.success("Signed in successfully.");

      const finalRedirectPath =
        result.role === "ADMIN"
          ? "/admin"
          : result.role === "ORGANIZER"
            ? "/organizer"
            : "/events";

      navigate(finalRedirectPath, { replace: true });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to sign in right now. Please try again.";
      toast.error(message);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-lg border-white/10 bg-slate-900/75">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Sign In</CardTitle>
          <CardDescription className="text-slate-300">
            Access your account to register for events and manage your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Email</label>
              <Input
                type="email"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
                {...register("email")}
              />
              {errors.email && <p className="mt-1 text-sm text-rose-400">{errors.email.message}</p>}
            </div>

            <div>
              <div className="mb-1 flex justify-between items-center text-sm text-slate-300">
                <label>Password</label>
                <Link to="/auth/forgot-password" className="text-brand-300 hover:text-brand-200">
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
                {...register("password")}
              />
              {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              variant="gradient"
              disabled={isSubmitting}
              className="w-full py-5 rounded-xl text-base"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>

            <div className="relative my-4 flex items-center gap-3">
              <div className="flex-1 border-t border-white/10" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">or</span>
              <div className="flex-1 border-t border-white/10" />
            </div>

            <GoogleSignInButton />
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-white/10 pt-5">
          <p className="text-sm text-slate-300">
            Don&apos;t have an account?{" "}
            <Link to="/sign-up" className="font-semibold text-brand-300 hover:text-brand-200">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
