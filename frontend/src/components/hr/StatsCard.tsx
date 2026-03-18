// src/components/hr/StatsCard.tsx
// Dashboard summary card — shows a single pipeline metric (e.g. "Passed: 12").
// Used in a row of 6 cards at the top of the applications page.

import * as React from "react";
import { cn } from "@/utils/classNames";

interface StatsCardProps {
  label: string;
  value: number | undefined;
  // Optional colour accent for the top border stripe
  accentClass?: string;
  isLoading?: boolean;
  // Clicking a card filters the list to that status tab
  onClick?: () => void;
  isActive?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  accentClass = "bg-slate-300",
  isLoading,
  onClick,
  isActive,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1 rounded-xl border bg-white p-4 text-left shadow-sm transition-all w-full",
        onClick && "hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        isActive && "ring-2 ring-indigo-500 border-indigo-200"
      )}
    >
      {/* Coloured accent stripe at top */}
      <div className={cn("h-1 w-8 rounded-full mb-1", accentClass)} />

      {/* Big number */}
      {isLoading ? (
        <div className="h-7 w-10 rounded bg-slate-100 animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-slate-800">{value ?? "—"}</p>
      )}

      {/* Label */}
      <p className="text-[12px] text-slate-500 font-medium">{label}</p>
    </button>
  );
};