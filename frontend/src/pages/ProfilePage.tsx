import { CircleUserRound } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { ApiError } from "../lib/http/httpClient";
import { useAppSelector } from "../store/hooks";
import { useGetMyProfile } from "../features/users/api/queries";
import { useUpdateMyProfile } from "../features/users/api/mutations";
import type { UpdateProfileRequestDto } from "../features/users/types";

export function ProfilePage() {
  const { accessToken, email, role } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();

  const [nameDraft, setNameDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: profileData, isLoading: isLoadingProfile } = useGetMyProfile();
  const { mutateAsync: updateProfile } = useUpdateMyProfile();

  useEffect(() => {
    if (!accessToken) {
      navigate("/sign-in");
    } else if (profileData && !nameDraft) {
      // Only set name draft if it's currently empty (initial load)
      setNameDraft(profileData.name);
    }
  }, [navigate, accessToken, profileData, nameDraft]);

  const isLoading = isLoadingProfile;

  async function onSave() {
    if (!accessToken || !profileData) return;

    const trimmedName = nameDraft.trim();
    if (trimmedName.length < 2) {
      toast.error("Name must be at least 2 characters.");
      return;
    }
    if (trimmedName.length > 80) {
      toast.error("Name must be at most 80 characters.");
      return;
    }

    setIsSaving(true);
    try {
      const request: UpdateProfileRequestDto = { name: trimmedName };
      await updateProfile({ request });
      toast.success("Profile updated successfully.");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to update profile right now.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-3xl border border-brand-300/20 bg-slate-900/70 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-pink/20 p-4 ring-1 ring-brand-500/30">
                <CircleUserRound className="h-8 w-8 text-brand-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">My Profile</h1>
                <p className="mt-1 text-sm text-slate-300">Manage your account settings and preferences.</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-8 space-y-6">
              <div className="h-32 animate-pulse rounded-2xl bg-slate-800/60" />
              <div className="h-40 animate-pulse rounded-2xl bg-slate-800/60" />
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-8 md:grid-cols-3">
                <div className="md:col-span-1">
                  <h2 className="text-lg font-semibold text-slate-100">Personal Info</h2>
                  <p className="mt-1 text-sm text-slate-400">Your registered email address and system role dictate your access level.</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 md:col-span-2 space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</div>
                    <div className="mt-1 text-slate-200">{profileData?.email ?? email ?? "Unknown"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Role</div>
                    <div className="mt-1 inline-flex rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">
                      {profileData?.role ?? role ?? "Not available"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-8 grid gap-8 md:grid-cols-3">
                <div className="md:col-span-1">
                  <h2 className="text-lg font-semibold text-slate-100">Display Settings</h2>
                  <p className="mt-1 text-sm text-slate-400">Update how your name appears to others across the platform.</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 md:col-span-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Display Name</span>
                    <input
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-slate-100 outline-none transition focus:border-brand-400 focus:bg-slate-900/80 focus:ring-2 focus:ring-brand-500/35"
                      required
                    />
                  </label>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void onSave()}
                      disabled={isSaving}
                      className="inline-flex rounded-xl bg-gradient-to-r from-brand-500 to-accent-pink px-6 py-2.5 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
