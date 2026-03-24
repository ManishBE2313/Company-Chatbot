"use client";

import * as React from "react";
import { Application, ApplicationStatus, Interview, Scorecard, UserRole } from "@/types/hr";
import { StatusBadge, AIScoreChip } from "./StatusBadge";
import { Button } from "@/components/ui/Button";
import { useApplication, useUpdateApplicationStatus } from "@/hooks/useHRData";
import { cn } from "@/utils/classNames";
import {
  CalendarDays,
  CheckCircle,
  ClipboardList,
  ExternalLink,
  FileText,
  Brain,
  Tag,
  UserCircle2,
  X,
  XCircle,
  RefreshCcw,
  Briefcase,
  ArrowRightCircle,
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
  const { application: fullApplication, isLoading: isLoadingDetail } = useApplication(application?.id ?? "");
  const { submit: updateStatus, isLoading: isUpdating } = useUpdateApplicationStatus(onStatusUpdated);

  if (!application) return null;

  const data = fullApplication ?? application;
  const candidate = data.candidate;
  const interviews = [...(data.interviews || [])].sort((a, b) => {
    const aTime = a.slot?.startTime ? new Date(a.slot.startTime).getTime() : 0;
    const bTime = b.slot?.startTime ? new Date(b.slot.startTime).getTime() : 0;
    return bTime - aTime;
  });
  const scheduledInterview = interviews.find((interview) => interview.status === "SCHEDULED") || interviews[0];
  const scorecards = interviews.map((interview) => interview.scorecard).filter(Boolean) as Scorecard[];
  const isBiasFlagged = data.aiTags?.some((t) => t.includes("high-bias-divergence"));

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[560px] flex-col overflow-hidden bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 shrink-0">
          <div>
            <h2 className="text-[16px] font-semibold text-slate-800">
              {candidate ? `${candidate.firstName} ${candidate.lastName}` : "Candidate"}
            </h2>
            <p className="mt-0.5 text-[13px] text-slate-400">{candidate?.email ?? "-"}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={data.status} />
            <AIScoreChip score={data.aiScore} />
            {isBiasFlagged && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-600 ring-1 ring-amber-200">
                <ClipboardList size={11} />
                Bias Flag
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <FileText size={14} className="text-slate-400" />
            <a href={data.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[13px] text-indigo-600 hover:underline">
              View Resume <ExternalLink size={11} />
            </a>
          </div>

          {data.aiReasoning && (
            <Section icon={<Brain size={14} />} title="AI Reasoning">
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-600">{data.aiReasoning}</p>
            </Section>
          )}

          {data.aiTags && data.aiTags.length > 0 && (
            <Section icon={<Tag size={14} />} title="AI Tags">
              <div className="flex flex-wrap gap-2">
                {data.aiTags.map((tag) => (
                  <span key={tag} className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                    tag.includes("MANUAL-REVIEW")
                      ? "bg-amber-50 text-amber-700 ring-amber-200"
                      : tag.includes("bias")
                      ? "bg-orange-50 text-orange-600 ring-orange-200"
                      : "bg-slate-100 text-slate-600 ring-slate-200"
                  )}>
                    {tag}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {data.status === "SCHEDULED" && scheduledInterview && (
            <Section icon={<CalendarDays size={14} />} title="Interview Details">
              <div className="rounded-3xl border border-cyan-100 bg-cyan-50/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-cyan-700">Locked In</p>
                    <h3 className="mt-1 text-[15px] font-semibold text-slate-800">{scheduledInterview.roundName}</h3>
                    <p className="mt-1 text-[13px] text-slate-500">
                      {scheduledInterview.slot?.startTime
                        ? new Date(scheduledInterview.slot.startTime).toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
                        : "Schedule time unavailable"}
                    </p>
                  </div>
                  {isAdmin && (
                    <Button variant="outline" size="sm" className="border-cyan-200 bg-white text-cyan-700 hover:bg-cyan-100" onClick={() => updateStatus(data.id, "SCHEDULING")} isLoading={isUpdating}>
                      <RefreshCcw size={13} />
                      Reschedule
                    </Button>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-2 text-[13px] text-slate-600">
                  <UserCircle2 size={15} className="text-slate-400" />
                  {scheduledInterview.interviewer
                    ? `${scheduledInterview.interviewer.firstName} ${scheduledInterview.interviewer.lastName ?? ""}`.trim()
                    : "Interviewer assigned"}
                </div>
              </div>
            </Section>
          )}

          {data.status === "EVALUATING" && scorecards.length > 0 && (
            <Section icon={<ClipboardList size={14} />} title="Scorecards">
              <div className="space-y-3">
                {scorecards.map((scorecard) => (
                  <div key={scorecard.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-semibold text-slate-800">
                          {scorecard.interviewer
                            ? `${scorecard.interviewer.firstName} ${scorecard.interviewer.lastName ?? ""}`.trim()
                            : "Interviewer"}
                        </p>
                        <p className="mt-1 text-[12px] text-slate-400">Feedback submitted</p>
                      </div>
                      <RecommendationBadge value={scorecard.recommendation} />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <MiniMetric label="Technical" value={`${scorecard.technicalScore}/10`} />
                      <MiniMetric label="Communication" value={`${scorecard.communicationScore}/10`} />
                    </div>
                    {scorecard.notes && (
                      <p className="mt-4 whitespace-pre-wrap text-[13px] leading-relaxed text-slate-600">{scorecard.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          <p className="text-[12px] text-slate-400">
            Applied on {new Date(data.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          {isLoadingDetail && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] text-slate-400">
              Loading interview context...
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">Admin Override</p>
            <div className="flex flex-wrap gap-2">
              {buildActions(data.status).map((action) => (
                <Button
                  key={action.label}
                  size="sm"
                  variant={action.variant}
                  className={action.className}
                  isLoading={isUpdating}
                  onClick={() => updateStatus(data.id, action.status)}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div>
    <div className="mb-2 flex items-center gap-1.5 text-slate-500">
      {icon}
      <p className="text-[12px] font-semibold uppercase tracking-wide">{title}</p>
    </div>
    {children}
  </div>
);

function RecommendationBadge({ value }: { value: Scorecard["recommendation"] }) {
  const config = {
    STRONG_HIRE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    HIRE: "bg-teal-50 text-teal-700 ring-teal-200",
    HOLD: "bg-amber-50 text-amber-700 ring-amber-200",
    NO_HIRE: "bg-red-50 text-red-700 ring-red-200",
  }[value];

  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${config}`}>{value.replaceAll("_", " ")}</span>;
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-200">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-[15px] font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function buildActions(status: ApplicationStatus) {
  if (status === "SCREENED") {
    return [
      {
        label: "Push to Scheduler",
        status: "SCHEDULING" as ApplicationStatus,
        variant: "primary" as const,
        className: "bg-purple-600 text-white hover:bg-purple-700 gap-1.5",
        icon: <ArrowRightCircle size={13} />,
      },
      {
        label: "Reject",
        status: "REJECTED" as ApplicationStatus,
        variant: "outline" as const,
        className: "border-red-200 text-red-600 hover:bg-red-50 gap-1.5",
        icon: <XCircle size={13} />,
      },
    ];
  }

  if (status === "EVALUATING") {
    return [
      {
        label: "Move to Next Round",
        status: "SCHEDULING" as ApplicationStatus,
        variant: "primary" as const,
        className: "bg-purple-600 text-white hover:bg-purple-700 gap-1.5",
        icon: <RefreshCcw size={13} />,
      },
      {
        label: "Extend Offer",
        status: "OFFERED" as ApplicationStatus,
        variant: "primary" as const,
        className: "bg-indigo-600 text-white hover:bg-indigo-700 gap-1.5",
        icon: <Briefcase size={13} />,
      },
      {
        label: "Reject",
        status: "REJECTED" as ApplicationStatus,
        variant: "outline" as const,
        className: "border-red-200 text-red-600 hover:bg-red-50 gap-1.5",
        icon: <XCircle size={13} />,
      },
    ];
  }

  if (status === "PENDING") {
    return [
      {
        label: "Mark Screened",
        status: "SCREENED" as ApplicationStatus,
        variant: "primary" as const,
        className: "bg-emerald-600 text-white hover:bg-emerald-700 gap-1.5",
        icon: <CheckCircle size={13} />,
      },
      {
        label: "Reject",
        status: "REJECTED" as ApplicationStatus,
        variant: "outline" as const,
        className: "border-red-200 text-red-600 hover:bg-red-50 gap-1.5",
        icon: <XCircle size={13} />,
      },
    ];
  }

  return [
    {
      label: "Reject",
      status: "REJECTED" as ApplicationStatus,
      variant: "outline" as const,
      className: "border-red-200 text-red-600 hover:bg-red-50 gap-1.5",
      icon: <XCircle size={13} />,
    },
  ];
}
