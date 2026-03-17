// src/app/hr/jobs/[jobId]/page.tsx
// Main applications tracking page for a single job.
// Asana-style: top stats row → tab bar → scrollable application list → detail drawer.

"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useJob, useApplications, usePipelineStats, useHRCurrentUser } from "@/hooks/useHRData";
import { ApplicationRow } from "@/components/hr/ApplicationRow";
import { StatsCard } from "@/components/hr/StatsCard";
import { ApplicationDetailDrawer } from "@/components/hr/ApplicationDetailDrawer";
import { UploadCVModal } from "@/components/hr/UploadCVModal";
import { Button } from "@/components/ui/Button";
import { Application, ApplicationStatus } from "@/types/hr";
import {
  ArrowLeft,
  Upload,
  MapPin,
  Users,
  Briefcase,
  Loader2,
  Inbox,
} from "lucide-react";
import Link from "next/link";

// ─── Tab definitions ──────────────────────────────────────────────────────────
// undefined status = "All" tab (no filter sent to backend)
interface Tab {
  label: string;
  status: ApplicationStatus | undefined;
  accentClass: string;
}

const TABS: Tab[] = [
  { label: "All",           status: undefined,        accentClass: "bg-slate-400"   },
  { label: "Passed",        status: "Passed",          accentClass: "bg-emerald-500" },
  { label: "Manual Review", status: "ManualReview",    accentClass: "bg-amber-400"   },
  { label: "Interviewing",  status: "Interviewing",    accentClass: "bg-blue-500"    },
  { label: "Rejected",      status: "Rejected",        accentClass: "bg-red-400"     },
  { label: "Pending",       status: "Pending",         accentClass: "bg-slate-300"   },
];

export default function JobApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();

  // ─── Data ─────────────────────────────────────────────────────────────────
  const { job, isLoading: jobLoading } = useJob(jobId);
  const { stats, isLoading: statsLoading } = usePipelineStats(jobId);
  const { user } = useHRCurrentUser();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  // Active tab drives the status filter passed to useApplications
  const [activeTab, setActiveTab] = React.useState<ApplicationStatus | undefined>(undefined);
  const { applications, isLoading: appsLoading, refetch } = useApplications(jobId, activeTab);

  // Drawer state — null means closed
  const [selectedApp, setSelectedApp] = React.useState<Application | null>(null);
  const [showUploadCV, setShowUploadCV] = React.useState(false);

  // ─── Stats card click handler ─────────────────────────────────────────────
  // Clicking a stats card switches to that tab — same UX as Asana's filter pills
  const handleStatCardClick = (status: ApplicationStatus | undefined) => {
    setActiveTab(status);
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Page header ── */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-8 py-5">

        {/* Back link */}
        <Link
          href="/hr"
          className="inline-flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-600 mb-3 transition-colors"
        >
          <ArrowLeft size={13} />
          All Jobs
        </Link>

        {/* Job title + meta */}
        {jobLoading ? (
          <div className="h-7 w-48 rounded-lg bg-slate-100 animate-pulse" />
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[20px] font-bold text-slate-800">{job?.title}</h1>
              <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                <Meta icon={<Briefcase size={12} />} text={job?.department} />
                <Meta icon={<MapPin size={12} />} text={job?.location} />
                <Meta icon={<Users size={12} />} text={`${job?.headcount} opening${(job?.headcount ?? 0) > 1 ? "s" : ""}`} />
                {/* Job status pill */}
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ring-1 ring-inset ${
                  job?.status === "Open"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-slate-100 text-slate-500 ring-slate-200"
                }`}>
                  {job?.status}
                </span>
              </div>
            </div>

            {/* Upload CV button — admin only */}
            {isAdmin && (
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shrink-0"
                onClick={() => setShowUploadCV(true)}
              >
                <Upload size={13} />
                Upload CV
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── Stats cards row ── */}
      <div className="shrink-0 px-8 py-5 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <StatsCard
            label="Total"
            value={stats?.total}
            accentClass="bg-slate-400"
            isLoading={statsLoading}
            isActive={activeTab === undefined}
            onClick={() => handleStatCardClick(undefined)}
          />
          <StatsCard
            label="Passed"
            value={stats?.passed}
            accentClass="bg-emerald-500"
            isLoading={statsLoading}
            isActive={activeTab === "Passed"}
            onClick={() => handleStatCardClick("Passed")}
          />
          <StatsCard
            label="Manual Review"
            value={stats?.manualReview}
            accentClass="bg-amber-400"
            isLoading={statsLoading}
            isActive={activeTab === "ManualReview"}
            onClick={() => handleStatCardClick("ManualReview")}
          />
          <StatsCard
            label="Interviewing"
            value={stats?.interviewing}
            accentClass="bg-blue-500"
            isLoading={statsLoading}
            isActive={activeTab === "Interviewing"}
            onClick={() => handleStatCardClick("Interviewing")}
          />
          <StatsCard
            label="Rejected"
            value={stats?.rejected}
            accentClass="bg-red-400"
            isLoading={statsLoading}
            isActive={activeTab === "Rejected"}
            onClick={() => handleStatCardClick("Rejected")}
          />
          <StatsCard
            label="Pending"
            value={stats?.pending}
            accentClass="bg-slate-300"
            isLoading={statsLoading}
            isActive={activeTab === "Pending"}
            onClick={() => handleStatCardClick("Pending")}
          />
        </div>
      </div>

      {/* ── Tab bar ── */}
      {/* Mirrors Asana's horizontal tab strip above list views */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-8">
        <div className="flex gap-0">
          {TABS.map((tab) => {
            const isActive = tab.status === activeTab;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.status)}
                className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Applications list ── */}
      <div className="flex-1 overflow-y-auto bg-white">

        {/* Column header row — Asana-style subtle header above list */}
        <div className="flex items-center gap-4 px-6 py-2 border-b border-slate-100 bg-slate-50">
          <div className="w-8 shrink-0" /> {/* avatar spacer */}
          <p className="flex-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Candidate</p>
          <p className="hidden sm:block text-[11px] font-semibold text-slate-400 uppercase tracking-wide w-24 text-right">Applied</p>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide shrink-0">AI Score</p>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide w-28 text-right">Status</p>
          <div className="w-4 shrink-0" /> {/* chevron spacer */}
        </div>

        {appsLoading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          // Empty state per tab
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
              <Inbox size={22} className="text-slate-400" />
            </div>
            <p className="text-[14px] font-medium text-slate-600">No applications</p>
            <p className="text-[12px] text-slate-400 mt-1">
              {activeTab
                ? `No candidates with status "${activeTab}" yet.`
                : "No candidates have applied to this job yet."}
            </p>
          </div>
        ) : (
          applications.map((app) => (
            <ApplicationRow
              key={app.id}
              application={app}
              onClick={setSelectedApp}
              isSelected={selectedApp?.id === app.id}
            />
          ))
        )}
      </div>

      {/* ── Detail Drawer ── */}
      {selectedApp && (
        <ApplicationDetailDrawer
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          userRole={user?.role ?? "user"}
          onStatusUpdated={() => {
            // After admin overrides status: close drawer + refetch list
            setSelectedApp(null);
            refetch();
          }}
        />
      )}

      {/* ── Upload CV Modal ── */}
      {showUploadCV && (
        <UploadCVModal
          preselectedJobId={jobId}
          onClose={() => setShowUploadCV(false)}
          onUploaded={() => {
            setShowUploadCV(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

// ─── Small meta pill used in job header ───────────────────────────────────────
const Meta: React.FC<{ icon: React.ReactNode; text?: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-1 text-[12px] text-slate-400">
    {icon}
    <span>{text ?? "—"}</span>
  </div>
);