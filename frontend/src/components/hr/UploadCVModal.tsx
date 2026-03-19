// src/components/hr/UploadCVModal.tsx
// Modal for admin to manually submit a candidate CV URL.
// On submit it creates candidate + application rows and starts AI screening.

"use client";

import * as React from "react";
import { useUploadCV, useJobs } from "@/hooks/useHRData";
import { Button } from "@/components/ui/Button";
import { X, CheckCircle } from "lucide-react";

interface UploadCVModalProps {
  // Pre-select a job if the modal is opened from a specific job's page
  preselectedJobId?: string;
  onClose: () => void;
  onUploaded: (applicationId: string) => void;
}

export const UploadCVModal: React.FC<UploadCVModalProps> = ({
  preselectedJobId,
  onClose,
  onUploaded,
}) => {
  const [jobId, setJobId] = React.useState(preselectedJobId ?? "");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [resumeUrl, setResumeUrl] = React.useState("");
  const [successId, setSuccessId] = React.useState<string | null>(null);

  // Load job list for the dropdown selector
  const { jobs, isLoading: jobsLoading } = useJobs();

  const { submit, isLoading, error } = useUploadCV((applicationId) => {
    // Show success state briefly before closing
    setSuccessId(applicationId);
    setTimeout(() => {
      onUploaded(applicationId);
      onClose();
    }, 1500);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit({ jobId, firstName, lastName, email, resumeUrl });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[1px]" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-[16px] font-semibold text-slate-800">Upload Candidate CV</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
              <X size={18} />
            </button>
          </div>

          {/* Success state — shown briefly after submission */}
          {successId ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-emerald-600">
              <CheckCircle size={40} strokeWidth={1.5} />
              <p className="text-[14px] font-medium">CV submitted! AI screening started.</p>
              <p className="text-[12px] text-slate-400">Application ID: {successId}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

              {/* Job selector */}
              <Field label="Job Position" required>
                <select
                  className={inputCls}
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  required
                  disabled={jobsLoading}
                >
                  <option value="">
                    {jobsLoading ? "Loading jobs..." : "Select a job..."}
                  </option>
                  {/* Only show open jobs — no point screening for closed roles */}
                  {jobs
                    .filter((j) => j.status === "Open")
                    .map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} — {j.department}
                      </option>
                    ))}
                </select>
              </Field>

              {/* Candidate name row */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" required>
                  <input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" required />
                </Field>
                <Field label="Last Name" required>
                  <input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" required />
                </Field>
              </div>

              <Field label="Email" required>
                <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required />
              </Field>

              {/* Resume URL — matches what the backend stores in resumeUrl column */}
              <Field label="Resume URL" required>
                <input className={inputCls} value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} placeholder="https://... or local path" required />
              </Field>

              {error && (
                <p className="text-[13px] text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" isLoading={isLoading} type="submit">
                  Submit & Screen
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-colors";

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-medium text-slate-600">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);