"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/classNames";
import { CreateScorecardPayload, Interview } from "@/types/hr";
import { Sparkles, X } from "lucide-react";

const RECOMMENDATION_OPTIONS: CreateScorecardPayload["recommendation"][] = [
  "STRONG_HIRE",
  "HIRE",
  "HOLD",
  "NO_HIRE",
];

const RECOMMENDATION_STYLES: Record<CreateScorecardPayload["recommendation"], string> = {
  STRONG_HIRE: "border-emerald-300 bg-emerald-50 text-emerald-700",
  HIRE: "border-teal-300 bg-teal-50 text-teal-700",
  HOLD: "border-amber-300 bg-amber-50 text-amber-700",
  NO_HIRE: "border-red-300 bg-red-50 text-red-700",
};

interface ScorecardModalProps {
  interview: Interview;
  interviewerId: string;
  onClose: () => void;
  onSubmit: (payload: CreateScorecardPayload) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function ScorecardModal({
  interview,
  interviewerId,
  onClose,
  onSubmit,
  isLoading,
  error,
}: ScorecardModalProps) {
  const [technicalScore, setTechnicalScore] = React.useState(7);
  const [communicationScore, setCommunicationScore] = React.useState(7);
  const [recommendation, setRecommendation] = React.useState<CreateScorecardPayload["recommendation"]>("HIRE");
  const [notes, setNotes] = React.useState("");

  const candidateName = interview.application?.candidate
    ? `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`
    : "Candidate";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({
      interviewId: interview.id,
      interviewerId,
      technicalScore,
      communicationScore,
      recommendation,
      notes,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
        <form
          onSubmit={handleSubmit}
          className="my-auto flex w-full max-w-2xl max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]"
        >
          <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 shrink-0">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500">Interview Feedback</p>
              <h2 className="mt-1 text-[20px] font-semibold text-slate-800">{candidateName}</h2>
              <p className="mt-1 text-[13px] text-slate-400">{interview.roundName} - {interview.application?.job?.title ?? "Role"}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-5">
                <ScoreField
                  label="Technical depth"
                  value={technicalScore}
                  onChange={setTechnicalScore}
                  helper="How confidently would you trust this candidate on execution and problem solving?"
                />
                <ScoreField
                  label="Communication"
                  value={communicationScore}
                  onChange={setCommunicationScore}
                  helper="Clarity, collaboration, and ability to explain tradeoffs."
                />
                <div>
                  <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">Interview Notes</label>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={6}
                    placeholder="Capture strengths, concerns, and any signal HR should not miss."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex items-center gap-2 text-slate-700">
                  <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                    <Sparkles size={15} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold">Recommendation</p>
                    <p className="text-[12px] text-slate-400">Choose the clearest next-step signal for HR.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {RECOMMENDATION_OPTIONS.map((option) => {
                    const isSelected = recommendation === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setRecommendation(option)}
                        className={cn(
                          "w-full rounded-2xl border px-4 py-3 text-left transition-all",
                          isSelected
                            ? `${RECOMMENDATION_STYLES[option]} ring-2 ring-offset-1 ring-slate-200`
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        <p className="text-[13px] font-semibold">{option.replace("_", " ")}</p>
                        <p className="mt-1 text-[12px] opacity-80">
                          {option === "STRONG_HIRE" && "Clear yes. High conviction signal to move fast."}
                          {option === "HIRE" && "Positive overall signal with manageable risks."}
                          {option === "HOLD" && "Mixed evidence. Useful if another round is needed."}
                          {option === "NO_HIRE" && "Not enough signal to continue for this role."}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-600">{error}</div>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4 shrink-0">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700" isLoading={isLoading}>Submit Feedback</Button>
          </div>
        </form>
      </div>
    </>
  );
}

function ScoreField({
  label,
  value,
  onChange,
  helper,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-slate-700">{label}</p>
          <p className="mt-1 text-[12px] text-slate-400">{helper}</p>
        </div>
        <div className="rounded-2xl bg-slate-900 px-3 py-1 text-[13px] font-semibold text-white">{value}/10</div>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
      />
      <div className="mt-2 flex justify-between text-[11px] text-slate-400">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}
