import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import toast from "react-hot-toast";
import { forgotPassword, resetPassword } from "../api/authApi";

const reqOtpSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email address.")
});

const resetPwdSchema = z.object({
  otpCode: z.string().length(6, "OTP must be exactly 6 digits."),
  newPassword: z.string().min(6, "Password must be at least 6 characters.")
});

type ReqOtpFormValues = z.infer<typeof reqOtpSchema>;
type ResetPwdFormValues = z.infer<typeof resetPwdSchema>;

export function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const otpForm = useForm<ReqOtpFormValues>({
    resolver: zodResolver(reqOtpSchema)
  });

  const resetForm = useForm<ResetPwdFormValues>({
    resolver: zodResolver(resetPwdSchema)
  });

  const onReqOtpSubmit = async (data: ReqOtpFormValues) => {
    setIsLoading(true);
    try {
      const res = await forgotPassword(data.email);
      toast.success(res.message || "Reset link sent!");
      setEmail(data.email);
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPwdFormValues) => {
    setIsLoading(true);
    try {
      const res = await resetPassword({
        email,
        otpCode: data.otpCode,
        newPassword: data.newPassword
      });
      toast.success(res.message || "Password successfully changed!");
      navigate("/sign-in");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-lg border-white/10 bg-slate-900/75">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </CardTitle>
          <CardDescription className="text-slate-300">
            {step === 1
              ? "Enter your email to receive a recovery code."
              : `Enter the 6-digit code sent to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form className="space-y-4" onSubmit={otpForm.handleSubmit(onReqOtpSubmit)} noValidate>
              <div>
                <label className="mb-1 block text-sm text-slate-300">Email</label>
                <Input
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
                  {...otpForm.register("email")}
                />
                {otpForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-rose-400">{otpForm.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" variant="gradient" disabled={isLoading} className="w-full py-5 rounded-xl text-base mt-4">
                {isLoading ? "Sending..." : "Send Code"}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={resetForm.handleSubmit(onResetSubmit)} noValidate>
              <div>
                <label className="mb-1 block text-sm text-slate-300">6-Digit Code</label>
                <Input
                  type="text"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
                  {...resetForm.register("otpCode")}
                />
                {resetForm.formState.errors.otpCode && (
                  <p className="mt-1 text-sm text-rose-400">{resetForm.formState.errors.otpCode.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-300">New Password</label>
                <Input
                  type="password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
                  {...resetForm.register("newPassword")}
                />
                {resetForm.formState.errors.newPassword && (
                  <p className="mt-1 text-sm text-rose-400">{resetForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <Button type="submit" variant="gradient" disabled={isLoading} className="w-full py-5 rounded-xl text-base mt-4">
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-white/10 pt-5">
          <p className="text-sm text-slate-300">
            Remember your password?{" "}
            <Link to="/sign-in" className="font-semibold text-brand-300 hover:text-brand-200">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
