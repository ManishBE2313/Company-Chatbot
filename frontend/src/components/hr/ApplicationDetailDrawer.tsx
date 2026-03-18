// src/components/hr/ApplicationDetailDrawer.tsx
// Slide-in right drawer showing full AI analysis for one application.
// Admin/superadmin see status override buttons at the bottom.

"use client";

import * as React from "react";
import { Application, UserRole } from "@/types/hr";
import { StatusBadge, AIScoreChip } from "./StatusBadge";
import { Button } from "@/components/ui/Button";
import { useUpdateApplicationStatus } from "@/hooks/useHRData";
import { cn } from "@/utils/classNames";
import {
  X,
  FileText,
  Brain,
  Tag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";

interface ApplicationDetailDrawerProps {
  application: Application | null;
  onClose: () => void;
  userRole: UserRole;
  onStatusUpdated: () => void;
}

export const ApplicationDetailDrawer: React.FC<ApplicationDetailDrawerProps> = ({
  application,
  onClose,
  userRole,
  onStatusUpdated,
}) => {
  const isAdmin = userRole === "admin" || userRole === "superadmin";
  const { submit: updateStatus, isLoading: isUpdating } =
    useUpdateApplicationStatus(onStatusUpdated);

  if (!application) return null;

  const candidate = application.candidate;

  // Check if Tier 3 scoring agent raised a bias flag on this application
  const isBiasFlagged = application.aiTags?.some((t) =>
    t.includes("high-bias-divergence")
  );

  return (
    <>
      {/* Dimmed overlay — clicking it closes the drawer */}
      <div
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[520px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-[16px] font-semibold text-slate-800">
              {candidate
                ? `${candidate.firstName} ${candidate.lastName}`
                : "Candidate"}
            </h2>
            <p className="text-[13px] text-slate-400 mt-0.5">
              {candidate?.email ?? "—"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Status + score + bias flag chips */}
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={application.status} />
            <AIScoreChip score={application.aiScore} />
            {isBiasFlagged && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 ring-1 ring-amber-200 rounded-full px-2.5 py-0.5 font-medium">
                <AlertTriangle size={11} />
                Bias Flag
              </span>
            )}
          </div>

          {/* Resume link */}
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-slate-400" />
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-indigo-600 hover:underline flex items-center gap-1"
            >
              View Resume <ExternalLink size={11} />
            </a>
          </div>

          {/* AI Reasoning — the full text from scoring_agent.py */}
          {application.aiReasoning && (
            <Section icon={<Brain size={14} />} title="AI Reasoning">
              <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                {application.aiReasoning}
              </p>
            </Section>
          )}

          {/* AI Tags — colour-coded by tag content */}
          {application.aiTags && application.aiTags.length > 0 && (
            <Section icon={<Tag size={14} />} title="AI Tags">
              <div className="flex flex-wrap gap-2">
                {application.aiTags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "text-[11px] px-2.5 py-0.5 rounded-full ring-1 ring-inset font-medium",
                      tag.includes("MANUAL-REVIEW")
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : tag.includes("bias")
                        ? "bg-orange-50 text-orange-600 ring-orange-200"
                        : "bg-slate-100 text-slate-600 ring-slate-200"
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Applied date */}
          <p className="text-[12px] text-slate-400">
            Applied on{" "}
            {new Date(application.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* ── Admin override footer — only visible to admin/superadmin ── */}
        {isAdmin && (
          <div className="shrink-0 border-t border-slate-100 px-6 py-4 bg-slate-50">
            <p className="text-[11px] text-slate-400 mb-3 font-medium uppercase tracking-wide">
              Admin Override
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                isLoading={isUpdating}
                onClick={() => updateStatus(application.id, "Passed")}
              >
                <CheckCircle size={13} /> Approve
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                isLoading={isUpdating}
                onClick={() => updateStatus(application.id, "Interviewing")}
              >
                Move to Interview
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                isLoading={isUpdating}
                onClick={() => updateStatus(application.id, "Rejected")}
              >
                <XCircle size={13} /> Reject
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Section wrapper used inside the drawer body ──────────────────────────────
const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div>
    <div className="flex items-center gap-1.5 text-slate-500 mb-2">
      {icon}
      <p className="text-[12px] font-semibold uppercase tracking-wide">{title}</p>
    </div>
    {children}
  </div>
);
