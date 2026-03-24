"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { InterviewSlot } from "@/types/hr";
import { useCreateInterviewSlot, useDeleteInterviewSlot } from "@/hooks/useHRData";
import { CalendarDays, Clock3, Plus, Trash2, X } from "lucide-react";

interface InterviewSlotManagerProps {
  userEmail: string;
  slots: InterviewSlot[];
  onRefresh: () => void;
}

export function InterviewSlotManager({ userEmail, slots, onRefresh }: InterviewSlotManagerProps) {
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const { submit: createSlot, isLoading: isCreating, error: createError } = useCreateInterviewSlot(async () => {
    onRefresh();
  });
  const { submit: deleteSlot, isLoading: isDeleting } = useDeleteInterviewSlot(async () => {
    onRefresh();
  });

  const groupedSlots = React.useMemo(() => {
    const groups = new Map<string, InterviewSlot[]>();

    for (const slot of slots) {
      const key = new Date(slot.startTime).toDateString();
      const existing = groups.get(key) || [];
      existing.push(slot);
      groups.set(key, existing);
    }

    return Array.from(groups.entries()).map(([key, value]) => ({
      key,
      label: new Date(value[0].startTime).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      slots: value,
    }));
  }, [slots]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Availability</p>
          <h3 className="mt-1 text-[17px] font-semibold text-slate-800">My Free Time</h3>
          <p className="mt-1 text-[13px] text-slate-400">Offer interview windows and let the auto-matcher fill them.</p>
        </div>
        <Button className="bg-indigo-600 text-white hover:bg-indigo-700 gap-1.5" onClick={() => setShowCreateModal(true)}>
          <Plus size={14} />
          Add Free Time
        </Button>
      </div>

      <div className="space-y-4">
        {groupedSlots.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-400">
            <CalendarDays size={20} className="mx-auto mb-3" />
            <p className="text-[14px] font-medium text-slate-600">No availability yet</p>
            <p className="mt-1 text-[12px] text-slate-400">Add a few blocks and the scheduler will start using them.</p>
          </div>
        ) : (
          groupedSlots.map((group) => (
            <section key={group.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-slate-700">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <CalendarDays size={16} />
                </div>
                <div>
                  <h4 className="text-[14px] font-semibold">{group.label}</h4>
                  <p className="text-[12px] text-slate-400">{group.slots.length} time block{group.slots.length > 1 ? "s" : ""}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {group.slots.map((slot) => {
                  const candidateName = slot.interview?.application?.candidate
                    ? `${slot.interview.application.candidate.firstName} ${slot.interview.application.candidate.lastName}`
                    : null;
                  const roleName = slot.interview?.application?.job?.title;
                  const isBooked = Boolean(slot.isBooked);

                  return (
                    <div
                      key={slot.id}
                      className={isBooked
                        ? "rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-600 to-indigo-500 p-4 text-white"
                        : "rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-700"}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-wide opacity-80">
                            {isBooked ? "Booked" : "Available"}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-[13px] font-semibold">
                            <Clock3 size={14} />
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </div>
                        </div>

                        {!isBooked && (
                          <button
                            type="button"
                            onClick={() => deleteSlot(userEmail, slot.id)}
                            disabled={isDeleting}
                            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {isBooked ? (
                        <div className="mt-5 rounded-2xl bg-white/12 px-3 py-3">
                          <p className="text-[14px] font-semibold">{candidateName ?? "Interview booked"}</p>
                          <p className="mt-1 text-[12px] text-white/80">{roleName ?? slot.interview?.roundName ?? "Interview"}</p>
                        </div>
                      ) : (
                        <p className="mt-5 text-[12px] text-slate-400">Open for auto-matching</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      {showCreateModal && (
        <CreateSlotModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (payload) => {
            await createSlot(userEmail, payload);
            setShowCreateModal(false);
          }}
          isLoading={isCreating}
          error={createError}
        />
      )}
    </div>
  );
}

function CreateSlotModal({
  onClose,
  onSubmit,
  isLoading,
  error,
}: {
  onClose: () => void;
  onSubmit: (payload: { startTime: string; endTime: string }) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}) {
  const [date, setDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("10:00");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!date) return;
    await onSubmit({
      startTime: new Date(`${date}T${startTime}:00`).toISOString(),
      endTime: new Date(`${date}T${endTime}:00`).toISOString(),
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500">Availability Block</p>
              <h3 className="mt-1 text-[19px] font-semibold text-slate-800">Add Free Time</h3>
            </div>
            <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-4 px-6 py-6 sm:grid-cols-3">
            <Field label="Date">
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20" />
            </Field>
            <Field label="Start time">
              <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20" />
            </Field>
            <Field label="End time">
              <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20" />
            </Field>
          </div>

          {error && <div className="mx-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-600">{error}</div>}

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700" isLoading={isLoading}>Save Slot</Button>
          </div>
        </form>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
