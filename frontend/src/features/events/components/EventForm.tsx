import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { generateAiDescription } from "../api/eventsApi";

const EventFormSchema = z.object({
  name: z.string().trim().min(3, "Event name must be at least 3 characters"),
  description: z.string().trim().min(1, "Description is required"),
  venue: z.string().trim().min(1, "Venue is required"),
  datePart: z.string().trim().min(1, "Date is required"),
  timePart: z.string().trim().min(1, "Time is required"),
  feeText: z.string().regex(/^\d+(\.\d*)?$/, "Fee must be a valid non-negative number").refine((v) => Number(v) >= 0, "Fee cannot be negative"),
  capacityText: z.string().regex(/^\d+$/, "Capacity must be a whole number").refine((v) => Number(v) >= 1, "Capacity must be at least 1"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type EventFormValues = z.infer<typeof EventFormSchema>;

interface EventFormProps {
  initialValues: EventFormValues;
  onSubmit: (data: EventFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export function EventForm({ initialValues, onSubmit, onCancel, isSubmitting, submitLabel }: EventFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  async function handleMagicGenerate() {
    const title = getValues("name").trim();
    if (!title || title.length < 3) {
      toast.error("Enter a descriptive event name first so AI can get creative!");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("✨ AI is writing your description...");
    try {
      const description = await generateAiDescription(title);
      setValue("description", description, { shouldValidate: true });
      toast.success("Description generated!", { id: toastId });
    } catch {
      toast.error("AI generation failed. Check your API key or try again.", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Event name</label>
        <Input
          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
          placeholder="e.g. React Conference"
          {...register("name")}
        />
        {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Description</label>
          <button
            type="button"
            onClick={handleMagicGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500/50 bg-brand-900/40 px-2.5 py-1 text-xs font-semibold text-brand-300 transition hover:bg-brand-800/50 hover:text-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : "animate-pulse"}`} />
            {isGenerating ? "Generating..." : "Magic ✨"}
          </button>
        </div>
        <Textarea
          className="min-h-[90px] w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
          placeholder="What is this event about? Or click Magic ✨ to auto-generate!"
          {...register("description")}
        />
        {errors.description && <p className="mt-1 text-xs text-rose-400">{errors.description.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Feature Image URL (Optional)</label>
        <Input
          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
          placeholder="https://images.unsplash.com/photo-..."
          {...register("imageUrl")}
        />
        {errors.imageUrl && <p className="mt-1 text-xs text-rose-400">{errors.imageUrl.message}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Date</label>
          <Input
            type="date"
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
            {...register("datePart")}
          />
          {errors.datePart && <p className="mt-1 text-xs text-rose-400">{errors.datePart.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Time</label>
          <Input
            type="time"
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
            {...register("timePart")}
          />
          {errors.timePart && <p className="mt-1 text-xs text-rose-400">{errors.timePart.message}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Venue</label>
        <Input
          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
          placeholder="Bengaluru"
          {...register("venue")}
        />
        {errors.venue && <p className="mt-1 text-xs text-rose-400">{errors.venue.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Fee (INR)</label>
          <Input
            type="text"
            inputMode="numeric"
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
            {...register("feeText")}
          />
          {errors.feeText && <p className="mt-1 text-xs text-rose-400">{errors.feeText.message}</p>}
        </div>

        <div>
           <label className="mb-1 block text-sm font-medium text-slate-300">Capacity</label>
           <Input
             type="text"
             inputMode="numeric"
             className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/35"
             {...register("capacityText")}
           />
           {errors.capacityText && <p className="mt-1 text-xs text-rose-400">{errors.capacityText.message}</p>}
        </div>
      </div>

      <div className="mt-6 flex gap-3 sm:justify-end pt-4 border-t border-white/10">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
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
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
