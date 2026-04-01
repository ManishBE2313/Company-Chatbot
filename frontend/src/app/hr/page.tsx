// src/app/hr/page.tsx
// HR Dashboard — top-level overview showing all jobs and their pipeline health.

"use client";

import * as React from "react";
import Link from "next/link";
import { useJobs, useHRCurrentUser } from "@/hooks/useHRData";
import { CreateJobModal } from "@/components/hr/CreateJobModal";
import { UploadCVModal } from "@/components/hr/UploadCVModal";
import CreateDraftJobModal from "@/components/hr/CreateDraftJobModal"; 
import { Button } from "@/components/ui/Button";
import { AsanaSpinner } from "@/components/ui/AsanaSpinner";
import {
  Briefcase,
  Plus,
  Upload,
  MapPin,
  Users,
  ChevronRight,
} from "lucide-react";
import { Job } from "@/types/hr";
import { useState } from "react";
import AddEmployeeModal from "@/components/hr/AddEmployeeModal";

export default function HRDashboardPage() {
    const [open, setOpen] = useState(false);
  const { jobs, isLoading, refetch } = useJobs();
  const { user } = useHRCurrentUser();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const [showCreateJob, setShowCreateJob] = React.useState(false);
  const [showUploadCV, setShowUploadCV] = React.useState(false);
  const [showDraftJob, setShowDraftJob] = React.useState(false); // <-- Added state

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800">Recruitment Dashboard</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Manage jobs and track AI screening pipeline
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Only Admins see Upload CV */}
          {isAdmin && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-slate-600"
                onClick={() => setShowUploadCV(true)}
              >
                <Upload size={14} />
                Upload CV
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-slate-600"
                onClick={() => setOpen(true)}
              >
                <Users size={14} />
                Add Employee
              </Button>
            </>
          )}
          
          {/* Everyone sees standard "New Job" */}
          <Button
            size="sm"
            className="bg-slate-800 hover:bg-slate-900 text-white gap-1.5"
            onClick={() => setShowCreateJob(true)}
          >
            <Plus size={14} />
            New Job
          </Button>

          {/* Everyone sees new "Request New Role" */}
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            onClick={() => setShowDraftJob(true)}
          >
            <Plus size={14} />
            Request New Job
          </Button>
        </div>
      </div>

      {/* ── Jobs grid ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <AsanaSpinner size="lg" />
        </div>
      ) : jobs.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Briefcase size={24} className="text-slate-400" />
          </div>
          <p className="text-[15px] font-medium text-slate-600">No jobs yet</p>
          <p className="text-[13px] text-slate-400 mt-1">
            Create your first job to start the AI pipeline.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {showCreateJob && (
        <CreateJobModal
          onClose={() => setShowCreateJob(false)}
          onCreated={refetch}
        />
      )}
      {showUploadCV && (
        <UploadCVModal
          onClose={() => setShowUploadCV(false)}
          onUploaded={() => setShowUploadCV(false)}
        />
      )}
      {showDraftJob && (
        <CreateDraftJobModal
          isOpen={showDraftJob}
          onClose={() => setShowDraftJob(false)}
          onSuccess={() => {
            setShowDraftJob(false);
            refetch();
          }}
        />
      )}
      {open && <AddEmployeeModal onClose={() => setOpen(false)} />}
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
const JobCard: React.FC<{ job: Job }> = ({ job }) => {
  const statusColor =
    job.status === "Open"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : job.status === "Closed"
      ? "bg-slate-100 text-slate-500 ring-slate-200"
      : "bg-amber-50 text-amber-600 ring-amber-200";

  return (
    <Link href={`/hr/jobs/${job.id}`}>
      <div className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">

        {/* Top row — title + status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-[14px] font-semibold text-slate-800 leading-snug">
            {job.title}
          </h3>
          <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ring-1 ring-inset ${statusColor}`}>
            {job.status}
          </span>
        </div>

        {/* Meta info */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
            <Briefcase size={12} />
            {job.department}
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
            <MapPin size={12} />
            {job.location}
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
            <Users size={12} />
            {job.headcount} opening{job.headcount > 1 ? "s" : ""}
          </div>
        </div>

        {/* Footer — created date + arrow */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-300">
            {new Date(job.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <ChevronRight
            size={15}
            className="text-slate-300 group-hover:text-indigo-500 transition-colors"
          />
        </div>
      </div>
    </Link>
  );
};
