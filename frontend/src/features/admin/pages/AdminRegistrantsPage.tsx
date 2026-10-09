import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ApiError } from "../../../lib/http/httpClient";
import { type UserSummaryDto } from "../api/adminUsersApi";

import { useGetAdminRegistrants } from "../../users/api/queries";
import { useCreateAdminUser } from "../../users/api/mutations";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { EmptyState } from "../../../components/shared/EmptyState";

const AdminRegistrantSchema = z.object({
  name: z.string().trim().min(2, "Name must be between 2 and 80 characters").max(80, "Name must be between 2 and 80 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be between 8 and 128 characters").max(128, "Password must be at most 128 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type AdminRegistrantValues = z.infer<typeof AdminRegistrantSchema>;

export function AdminRegistrantsPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminRegistrantValues>({
    resolver: zodResolver(AdminRegistrantSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const { data: registrantsData, isLoading: isLoadingRegistrants } = useGetAdminRegistrants();
  const { mutateAsync: createAdminUser, isPending: isCreating } = useCreateAdminUser();

  const registrants = registrantsData ?? null;
  const isLoading = isLoadingRegistrants;
  const isSubmitting = isCreating;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return registrants ?? [];
    return (registrants ?? []).filter(
      (u: UserSummaryDto) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );

  }, [registrants, search]);

  async function onCreate(data: AdminRegistrantValues) {

    const request = { name: data.name, email: data.email, password: data.password };

    try {
      await createAdminUser({ request: { ...request, role: "REGISTRANT" } });
      toast.success("Registrant created.");
      reset();
      setIsModalOpen(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to create registrant.";
      toast.error(message);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-brand-300/20 bg-slate-900/70 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Registrants</h1>
            <p className="mt-2 text-sm text-slate-300">View all registrant accounts and add new ones.</p>
          </div>

          <div className="w-full flex-col sm:w-auto flex sm:flex-row gap-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
              placeholder="Search by name or email..."
            />
            <Button
              type="button"
              variant="gradient"
              onClick={() => {
                reset();
                setIsModalOpen(true);
              }}
            >
              + Add Registrant
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-800/60" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState title="No registrants found" description="Try changing your search." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-transparent">
                      <TableHead className="font-semibold text-slate-200">Name</TableHead>
                      <TableHead className="font-semibold text-slate-200">Email</TableHead>
                      <TableHead className="font-semibold text-slate-200">ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((u: UserSummaryDto) => (
                      <TableRow key={u.id} className="border-b border-white/5 hover:bg-slate-800/40">
                        <TableCell>{u.name}</TableCell>
                        <TableCell className="text-slate-300">{u.email}</TableCell>
                        <TableCell className="text-slate-300">{u.id}</TableCell>
                      </TableRow>
                    ))}

                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border-white/10 bg-slate-900 text-slate-100 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Registrant</DialogTitle>
            <DialogDescription className="text-slate-400">Creates a new REGISTRANT account.</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit(onCreate)} noValidate>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Name</label>
              <Input
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
                placeholder="Full name"
                {...register("name")}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
              <Input
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
                placeholder="name@example.com"
                inputMode="email"
                {...register("email")}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Password</label>
              <Input
                type="password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
                placeholder="Min 8 characters"
                autoComplete="new-password"
                {...register("password")}
              />
              {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Confirm Password</label>
              <Input
                type="password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
                placeholder="Re-enter password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword.message}</p>}
            </div>

            <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 border-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                disabled={isSubmitting}
                className="rounded-xl px-6"
              >
                {isSubmitting ? "Creating..." : "Add Registrant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
