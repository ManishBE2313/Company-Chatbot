"use client";

import * as React from "react";
import { InterviewSlotManager } from "@/components/hr/InterviewSlotManager";
import { ScorecardModal } from "@/components/hr/ScorecardModal";
import { StatusBadge } from "@/components/hr/StatusBadge";
import { AsanaSpinner } from "@/components/ui/AsanaSpinner";
import { Button } from "@/components/ui/Button";
import { useHRCurrentUser, useMyInterviews, useMyInterviewSlots, useSubmitScorecard } from "@/hooks/useHRData";
import { Interview } from "@/types/hr";
import { CalendarCheck2, CalendarDays, ExternalLink, MessageSquareText } from "lucide-react";

const TABS = [
  { id: "availability", label: "My Availability" },
  { id: "upcoming", label: "Upcoming Interviews" },
] as const;

export default function MyInterviewsPage() {
  const { user, isLoading: userLoading } = useHRCurrentUser();
  const userEmail = user?.email ?? null;
  const { slots, isLoading: slotsLoading, refetch: refetchSlots } = useMyInterviewSlots(userEmail);
  const { interviews, isLoading: interviewsLoading, refetch: refetchInterviews } = useMyInterviews(userEmail);
  const { submit: submitScorecard, isLoading: isSubmittingScorecard, error: scorecardError } = useSubmitScorecard(async () => {
    refetchInterviews();
  });
  const [activeTab, setActiveTab] = React.useState<(typeof TABS)[number]["id"]>("availability");
  const [selectedInterview, setSelectedInterview] = React.useState<Interview | null>(null);

  const sortedInterviews = React.useMemo(
    () => [...interviews].sort((a, b) => new Date(a.slot?.startTime || 0).getTime() - new Date(b.slot?.startTime || 0).getTime()),
    [interviews]
  );

  const isLoading = userLoading || slotsLoading || interviewsLoading;

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500">Interviewer Workspace</p>
            <h1 className="mt-2 text-[24px] font-semibold tracking-tight text-slate-800">My Interviews</h1>
            <p className="mt-1 text-[13px] text-slate-400">Manage your availability and keep feedback moving back to HR.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Signed in as</p>
            <p className="mt-1 text-[13px] font-medium text-slate-700">{userEmail ?? "Unknown user"}</p>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white px-8">
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={isActive
                  ? "border-b-2 border-indigo-600 px-4 py-3 text-[13px] font-semibold text-indigo-600"
                  : "border-b-2 border-transparent px-4 py-3 text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-700"
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-slate-400">
            <AsanaSpinner size="lg" />
          </div>
        ) : activeTab === "availability" ? (
          <InterviewSlotManager userEmail={userEmail || ""} slots={slots} onRefresh={refetchSlots} />
        ) : (
          <div className="space-y-4">
            {sortedInterviews.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-400 shadow-sm">
                <CalendarCheck2 size={20} className="mx-auto mb-3" />
                <p className="text-[14px] font-medium text-slate-600">No interviews scheduled yet</p>
                <p className="mt-1 text-[12px] text-slate-400">Your upcoming interview cards will appear here automatically.</p>
              </div>
            ) : (
              sortedInterviews.map((interview) => {
                const candidate = interview.application?.candidate;
                const slotTime = interview.slot?.startTime ? new Date(interview.slot.startTime) : null;
                const canSubmitFeedback = !interview.scorecard && interview.status === "SCHEDULED";

                return (
                  <div key={interview.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-[15px] font-semibold text-indigo-700">
                          {candidate ? `${candidate.firstName[0]}${candidate.lastName[0]}` : "?"}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-[16px] font-semibold text-slate-800">
                              {candidate ? `${candidate.firstName} ${candidate.lastName}` : "Candidate"}
                            </h2>
                            {interview.application?.status && <StatusBadge status={interview.application.status} />}
                          </div>
                          <p className="mt-1 text-[13px] text-slate-400">
                            {interview.application?.job?.title ?? "Role"} - {interview.roundName}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-slate-500">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
                              <CalendarDays size={13} />
                              {slotTime
                                ? slotTime.toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
                                : "Time pending"}
                            </span>
                            {interview.scorecard && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                                <MessageSquareText size={13} />
                                Feedback submitted
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {interview.meetLink ? (
                          <a href={interview.meetLink} target="_blank" rel="noreferrer">
                            <Button variant="outline" className="gap-1.5 border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
                              <ExternalLink size={14} />
                              Join Meeting
                            </Button>
                          </a>
                        ) : (
                          <Button variant="outline" disabled className="gap-1.5 border-slate-200 text-slate-400">
                            <ExternalLink size={14} />
                            Join Meeting
                          </Button>
                        )}
                        <Button
                          className="gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700"
                          disabled={!canSubmitFeedback}
                          onClick={() => setSelectedInterview(interview)}
                        >
                          <MessageSquareText size={14} />
                          {interview.scorecard ? "Feedback Submitted" : "Submit Feedback"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {selectedInterview && (
        <ScorecardModal
          interview={selectedInterview}
          interviewerId={selectedInterview.interviewerId}
          onClose={() => setSelectedInterview(null)}
          onSubmit={async (payload) => {
            await submitScorecard(payload);
            setSelectedInterview(null);
          }}
          isLoading={isSubmittingScorecard}
          error={scorecardError}
        />
      )}
    </div>
  );
}
