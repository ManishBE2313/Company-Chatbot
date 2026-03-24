"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { PipelineStageConfig } from "@/types/hr";
import { cn } from "@/utils/classNames";
import { Plus, Settings2, Trash2, X } from "lucide-react";

interface PipelineConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue?: PipelineStageConfig[] | null;
  onSave: (pipelineConfig: PipelineStageConfig[]) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const emptyRound = (index: number): PipelineStageConfig => ({
  id: `round-${index + 1}`,
  name: "",
  interviewerIds: [],
  interviewerEmails: [],
});

export function PipelineConfigDrawer({
  isOpen,
  onClose,
  initialValue,
  onSave,
  isLoading,
  error,
}: PipelineConfigDrawerProps) {
  const [rounds, setRounds] = React.useState<PipelineStageConfig[]>([]);

  React.useEffect(() => {
    setRounds(initialValue && initialValue.length > 0 ? initialValue : [emptyRound(0)]);
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  const updateRound = (index: number, updater: Partial<PipelineStageConfig>) => {
    setRounds((current) => current.map((round, roundIndex) => (
      roundIndex === index ? { ...round, ...updater } : round
    )));
  };

  const addRound = () => {
    setRounds((current) => [...current, emptyRound(current.length)]);
  };

  const removeRound = (index: number) => {
    setRounds((current) => current.filter((_, roundIndex) => roundIndex !== index));
  };

  const handleSave = async () => {
    const normalized = rounds
      .map((round, index) => ({
        id: round.id || `round-${index + 1}`,
        name: round.name.trim(),
        interviewerIds: round.interviewerIds || [],
        interviewerEmails: (round.interviewerEmails || [])
          .map((email) => email.trim())
          .filter(Boolean),
      }))
      .filter((round) => round.name.length > 0);

    await onSave(normalized);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[560px] flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <Settings2 size={12} />
              Pipeline Settings
            </div>
            <h2 className="mt-3 text-[20px] font-semibold text-slate-800">Interview Pipeline</h2>
            <p className="mt-1 text-[13px] text-slate-400">
              Define the rounds HR should send candidates through for this role.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-6 py-6">
          {rounds.map((round, index) => (
            <div key={round.id || index} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">
                    Round {index + 1}
                  </p>
                  <p className="mt-1 text-[14px] font-semibold text-slate-700">
                    {round.name.trim() || "Untitled round"}
                  </p>
                </div>
                {rounds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRound(index)}
                    className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <Field label="Round name">
                  <input
                    type="text"
                    value={round.name}
                    onChange={(event) => updateRound(index, { name: event.target.value })}
                    placeholder="Screening, Technical L1, System Design..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </Field>

                <Field label="Interviewer emails">
                  <textarea
                    value={(round.interviewerEmails || []).join(", ")}
                    onChange={(event) =>
                      updateRound(index, {
                        interviewerEmails: event.target.value
                          .split(",")
                          .map((value) => value.trim())
                          .filter(Boolean),
                      })
                    }
                    rows={3}
                    placeholder="jane@company.com, alex@company.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <p className="mt-2 text-[12px] text-slate-400">
                    Comma-separated. Stored with the round so HR can see intended owners.
                  </p>
                </Field>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addRound}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-white px-4 py-4 text-[13px] font-medium text-slate-500 transition-colors hover:border-indigo-300 hover:text-indigo-600"
            )}
          >
            <Plus size={16} />
            Add Round
          </button>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="button" className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleSave} isLoading={isLoading}>
            Save Pipeline
          </Button>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}
