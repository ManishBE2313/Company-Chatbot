import * as React from "react";
import { ApplicationStatus } from "@/types/hr";
import { cn } from "@/utils/classNames";
import {
  Briefcase,
  CalendarCheck,
  CalendarPlus,
  CheckCircle,
  ClipboardList,
  Clock,
  UserRoundSearch,
  XCircle,
} from "lucide-react";

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; classes: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pending",
    classes: "bg-slate-100 text-slate-600 ring-slate-200",
    icon: <Clock size={11} />,
  },
  SCREENED: {
    label: "Screened",
    classes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: <CheckCircle size={11} />,
  },
  SCHEDULING: {
    label: "Scheduling",
    classes: "bg-purple-50 text-purple-700 ring-purple-200",
    icon: <CalendarPlus size={11} />,
  },
  SCHEDULED: {
    label: "Scheduled",
    classes: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    icon: <CalendarCheck size={11} />,
  },
  EVALUATING: {
    label: "Evaluating",
    classes: "bg-orange-50 text-orange-700 ring-orange-200",
    icon: <ClipboardList size={11} />,
  },
  OFFERED: {
    label: "Offered",
    classes: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    icon: <Briefcase size={11} />,
  },
  REJECTED: {
    label: "Rejected",
    classes: "bg-red-50 text-red-600 ring-red-200",
    icon: <XCircle size={11} />,
  },
  WITHDRAWN: {
    label: "Withdrawn",
    classes: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: <UserRoundSearch size={11} />,
  },
};

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        config.classes,
        className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

interface AIScoreChipProps {
  score: number | null;
  className?: string;
}

export const AIScoreChip: React.FC<AIScoreChipProps> = ({ score, className }) => {
  if (score === null) {
    return (
      <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset bg-slate-100 text-slate-400 ring-slate-200", className)}>
        <Clock size={11} />
        Screening...
      </span>
    );
  }

  const colorClass =
    score >= 70
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : score >= 40
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-red-50 text-red-600 ring-red-200";

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset", colorClass, className)}>
      <ClipboardList size={11} />
      {score}/100
    </span>
  );
};
