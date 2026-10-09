import { Button } from "../ui/button";

interface PaginationControlsProps {
  page: number;
  setPage: (page: number | ((p: number) => number)) => void;
  hasNext: boolean;
  isLoading: boolean;
}

export function PaginationControls({ page, setPage, hasNext, isLoading }: PaginationControlsProps) {
  const hasPrev = page > 0;

  return (
    <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
      <Button
        variant="outline"
        type="button"
        className="bg-slate-900/90 text-slate-200 hover:text-white"
        disabled={!hasPrev || isLoading}
        onClick={() => setPage((p) => Math.max(0, p - 1))}
      >
        Prev
      </Button>
      <Button
        variant="outline"
        type="button"
        className="bg-slate-900/90 text-slate-200 hover:text-white"
        disabled={!hasNext || isLoading}
        onClick={() => setPage((p) => p + 1)}
      >
        Next
      </Button>
    </div>
  );
}
