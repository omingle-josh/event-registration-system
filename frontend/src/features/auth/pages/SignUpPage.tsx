import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/card";

import { useRegister } from "../hooks/useAuth";
import { ApiError } from "../../../lib/http/httpClient";

const SignUpSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
    password: z.string().trim().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().trim().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof SignUpSchema>;

export function SignUpPage() {
  const { mutateAsync: registerMutation, isPending: isSubmitting } = useRegister();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(data: SignUpFormValues) {
    try {
      await registerMutation({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success("Account created. Please sign in.");
      navigate("/sign-in", { replace: true });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to create your account right now. Please try again.";
      toast.error(message);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-lg border-white/10 bg-slate-900/75">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Create Account</CardTitle>
          <CardDescription className="text-slate-300">
            Register as a new participant and start booking your event seats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Name</label>
              <Input
                type="text"
                autoComplete="name"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
                {...register("name")}
              />
              {errors.name && <p className="mt-1 text-sm text-rose-400">{errors.name.message}</p>}
            </div>

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
              <label className="mb-1 block text-sm text-slate-300">Password</label>
              <Input
                type="password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
                {...register("password")}
              />
              {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">Confirm Password</label>
              <Input
                type="password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-rose-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="gradient"
              disabled={isSubmitting}
              className="w-full py-5 rounded-xl text-base"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-white/10 pt-5">
          <p className="text-sm text-slate-300">
            Already have an account?{" "}
            <Link to="/sign-in" className="font-semibold text-brand-300 hover:text-brand-200">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
