// src/components/hr/CreateJobModal.tsx
// Modal form for superadmin/admin to create a new job.
// On submit it hits POST /api/jobs/setup which also triggers AI vector generation.

"use client";

import * as React from "react";
import { useCreateJob } from "@/hooks/useHRData";
import { CreateJobPayload } from "@/types/hr";
import { Button } from "@/components/ui/Button";
import { X, Plus, Trash2 } from "lucide-react";

interface CreateJobModalProps {
  onClose: () => void;
  // Parent passes this to refetch the jobs list after creation
  onCreated: () => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  onClose,
  onCreated,
}) => {
  // Local form state — mirrors CreateJobPayload shape exactly
  const [title, setTitle] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [headcount, setHeadcount] = React.useState(1);
  const [minYears, setMinYears] = React.useState(0);
  const [educationLevel, setEducationLevel] = React.useState("Bachelor's");
  const [mustHave, setMustHave] = React.useState<string[]>([""]);
  const [niceToHave, setNiceToHave] = React.useState<string[]>([""]);
  const [notes, setNotes] = React.useState("");

  const { submit, isLoading, error } = useCreateJob(() => {
    onCreated();
    onClose();
  });

  // ─── Dynamic skill list helpers ───────────────────────────────────────────
  // Adds a blank entry to the must-have or nice-to-have skill arrays
  const addSkill = (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    setter((prev) => [...prev, ""]);

  const updateSkill = (
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) =>
    setter((prev) => prev.map((s, i) => (i === index ? value : s)));

  const removeSkill = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => setter((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateJobPayload = {
      title,
      department,
      location,
      headcount,
      requirements: {
        mustHaveSkills: mustHave.filter(Boolean),
        niceToHaveSkills: niceToHave.filter(Boolean),
        minYearsExperience: minYears,
        educationLevel,
        notes: notes || undefined,
      },
    };
    submit(payload);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[1px]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <h2 className="text-[16px] font-semibold text-slate-800">Create New Job</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
              <X size={18} />
            </button>
          </div>

          {/* Scrollable form body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Basic info row */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Job Title" required>
                <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Backend Engineer" required />
              </Field>
              <Field label="Department" required>
                <input className={inputCls} value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Engineering" required />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Location" required>
                <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote / London" required />
              </Field>
              <Field label="Headcount" required>
                <input className={inputCls} type="number" min={1} value={headcount} onChange={(e) => setHeadcount(Number(e.target.value))} required />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Min. Years Experience">
                <input className={inputCls} type="number" min={0} value={minYears} onChange={(e) => setMinYears(Number(e.target.value))} />
              </Field>
              <Field label="Education Level">
                <select className={inputCls} value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
                  {["Any", "High School", "Bachelor's", "Master's", "PhD"].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Must-have skills — dynamic list */}
            <Field label="Must-Have Skills">
              <div className="space-y-2">
                {mustHave.map((skill, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className={inputCls}
                      value={skill}
                      onChange={(e) => updateSkill(i, e.target.value, setMustHave)}
                      placeholder="e.g. TypeScript"
                    />
                    {mustHave.length > 1 && (
                      <button type="button" onClick={() => removeSkill(i, setMustHave)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addSkill(setMustHave)} className="flex items-center gap-1 text-[12px] text-indigo-600 hover:text-indigo-700 font-medium">
                  <Plus size={13} /> Add skill
                </button>
              </div>
            </Field>

            {/* Nice-to-have skills — same pattern */}
            <Field label="Nice-to-Have Skills">
              <div className="space-y-2">
                {niceToHave.map((skill, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className={inputCls}
                      value={skill}
                      onChange={(e) => updateSkill(i, e.target.value, setNiceToHave)}
                      placeholder="e.g. Docker"
                    />
                    {niceToHave.length > 1 && (
                      <button type="button" onClick={() => removeSkill(i, setNiceToHave)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addSkill(setNiceToHave)} className="flex items-center gap-1 text-[12px] text-indigo-600 hover:text-indigo-700 font-medium">
                  <Plus size={13} /> Add skill
                </button>
              </div>
            </Field>

            {/* Additional notes */}
            <Field label="Additional Notes">
              <textarea className={inputCls + " resize-none min-h-[80px]"} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any extra context for the AI..." />
            </Field>

            {error && <p className="text-[13px] text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          </form>

          {/* Footer actions */}
          <div className="shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" isLoading={isLoading} onClick={handleSubmit as any}>
              Create Job
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Tiny helpers ──────────────────────────────────────────────────────────────
const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-colors";

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-medium text-slate-600">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);