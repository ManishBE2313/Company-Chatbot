// src/components/hr/StatusBadge.tsx
// Reusable pill badge for application status + AI score chip.
// Single source of truth for status colours across every HR view.

import * as React from "react";
import { ApplicationStatus } from "@/types/hr";
import { cn } from "@/utils/classNames";
import { AlertTriangle, CheckCircle, XCircle, Clock, Star, Handshake } from "lucide-react";

// ─── Status config map ────────────────────────────────────────────────────────
// Each status gets a label, tailwind colour classes, and an icon.
// Adding a new status only requires updating this one object.
const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; classes: string; icon: React.ReactNode }
> = {
  Pending: {
    label: "Pending",
    classes: "bg-slate-100 text-slate-600 ring-slate-200",
    icon: <Clock size={11} />,
  },
  Passed: {
    label: "Passed",
    classes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: <CheckCircle size={11} />,
  },
  Rejected: {
    label: "Rejected",
    classes: "bg-red-50 text-red-600 ring-red-200",
    icon: <XCircle size={11} />,
  },
  Interviewing: {
    label: "Interviewing",
    classes: "bg-blue-50 text-blue-700 ring-blue-200",
    icon: <Star size={11} />,
  },
  Offered: {
    label: "Offered",
    classes: "bg-purple-50 text-purple-700 ring-purple-200",
    icon: <Handshake size={11} />,
  },
  ManualReview: {
    label: "Manual Review",
    classes: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: <AlertTriangle size={11} />,
  },
};

// ─── StatusBadge ─────────────────────────────────────────────────────────────
interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;

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

// ─── AIScoreChip ──────────────────────────────────────────────────────────────
// Separate chip just for the numeric AI score (0–100).
// Colour shifts green → amber → red based on score bands.
interface AIScoreChipProps {
  score: number | null;
  className?: string;
}

export const AIScoreChip: React.FC<AIScoreChipProps> = ({ score, className }) => {
  // No score yet means AI pipeline is still running
  if (score === null) {
    return (
      <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset bg-slate-100 text-slate-400 ring-slate-200", className)}>
        <Clock size={11} />
        Screening...
      </span>
    );
  }

  // Colour band: 70+ green, 40–69 amber, below 40 red
  const colorClass =
    score >= 70
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : score >= 40
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-red-50 text-red-600 ring-red-200";

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset", colorClass, className)}>
      <Star size={11} />
      {score}/100
    </span>
  );
};
