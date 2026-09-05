interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string; // Optional custom wrapper classes
}

export function EmptyState({ title, description, className = "bg-slate-950/20 px-6 py-10" }: EmptyStateProps) {
  return (
    <div className={`rounded-xl border border-dashed border-slate-600 text-center ${className}`}>
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}
