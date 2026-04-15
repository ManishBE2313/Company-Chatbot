import { cn } from "@/utils/classNames";
import { SurveyStatus } from "@/types/survey";

const STATUS_STYLES: Record<SurveyStatus, string> = {
  Draft: "bg-slate-100 text-slate-600",
  Upcoming: "bg-amber-100 text-amber-700",
  Active: "bg-emerald-100 text-emerald-700",
  Expired: "bg-rose-100 text-rose-700",
  Submitted: "bg-sky-100 text-sky-700",
};

export function SurveyStatusBadge({
  status,
  className,
}: {
  status: SurveyStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
        STATUS_STYLES[status],
        className
      )}
    >
      {status}
    </span>
  );
}
