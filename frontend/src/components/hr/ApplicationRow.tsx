// src/components/hr/ApplicationRow.tsx
// Single row in the applications list table.
// Clicking anywhere on the row opens the detail drawer.

import * as React from "react";
import { Application } from "@/types/hr";
import { StatusBadge, AIScoreChip } from "./StatusBadge";
import { cn } from "@/utils/classNames";
import { FileText, ChevronRight } from "lucide-react";

interface ApplicationRowProps {
  application: Application;
  onClick: (application: Application) => void;
  isSelected?: boolean;
}

export const ApplicationRow: React.FC<ApplicationRowProps> = ({
  application,
  onClick,
  isSelected,
}) => {
  const candidate = application.candidate;
  const fullName = candidate
    ? `${candidate.firstName} ${candidate.lastName}`
    : "Unknown Candidate";

  // Check if this application was flagged for bias by the scoring agent
  const isBiasFlagged = application.aiTags?.some((t) =>
    t.includes("high-bias-divergence")
  );

  return (
    <div
      onClick={() => onClick(application)}
      className={cn(
        "group flex items-center gap-4 px-6 py-3.5 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50",
        isSelected && "bg-indigo-50 border-l-2 border-l-indigo-500"
      )}
    >
      {/* Candidate avatar initials */}
      <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[12px] font-semibold shrink-0">
        {candidate
          ? `${candidate.firstName[0]}${candidate.lastName[0]}`
          : "?"}
      </div>

      {/* Name + email */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-medium text-slate-800 truncate">
            {fullName}
          </p>
          {/* Small warning dot if bias was detected by Tier 3 */}
          {isBiasFlagged && (
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" title="Bias flag detected" />
          )}
        </div>
        <p className="text-[12px] text-slate-400 truncate">
          {candidate?.email ?? "—"}
        </p>
      </div>

      {/* Applied date */}
      <p className="hidden sm:block text-[12px] text-slate-400 shrink-0 w-24 text-right">
        {new Date(application.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        })}
      </p>

      {/* AI Score chip */}
      <div className="shrink-0">
        <AIScoreChip score={application.aiScore} />
      </div>

      {/* Status badge */}
      <div className="shrink-0 w-28 flex justify-end">
        <StatusBadge status={application.status} />
      </div>

      {/* Chevron — shows on hover */}
      <ChevronRight
        size={16}
        className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0"
      />
    </div>
  );
};