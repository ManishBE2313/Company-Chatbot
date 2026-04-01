"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useApplications, useHRCurrentUser, useJob, usePipelineStats, useUpdateJobPipeline } from "@/hooks/useHRData";
import { ApplicationRow } from "@/components/hr/ApplicationRow";
import { StatsCard } from "@/components/hr/StatsCard";
import { ApplicationDetailDrawer } from "@/components/hr/ApplicationDetailDrawer";
import { UploadCVModal } from "@/components/hr/UploadCVModal";
import { PipelineConfigDrawer } from "@/components/hr/PipelineConfigDrawer";
import { Button } from "@/components/ui/Button";
import { AsanaSpinner } from "@/components/ui/AsanaSpinner";
import { Application, ApplicationStatus } from "@/types/hr";
import { ArrowLeft, MapPin, Settings2, Upload, Users, Briefcase, Inbox } from "lucide-react";
import Link from "next/link";
import SharepointSyncModal from "../../../../components/hr/SharepointSyncModal";
import { useState } from "react"; 

interface Tab {
  label: string;
  status: ApplicationStatus | undefined;
  accentClass: string;
}

const TABS: Tab[] = [
  { label: "All", status: undefined, accentClass: "bg-slate-400" },
  { label: "Screened", status: "SCREENED", accentClass: "bg-emerald-500" },
  { label: "Scheduling", status: "SCHEDULING", accentClass: "bg-purple-500" },
  { label: "Scheduled", status: "SCHEDULED", accentClass: "bg-cyan-500" },
  { label: "Evaluating", status: "EVALUATING", accentClass: "bg-orange-500" },
  { label: "Rejected", status: "REJECTED", accentClass: "bg-red-400" },
  { label: "Offered", status: "OFFERED", accentClass: "bg-indigo-500" },
];

export default function JobApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { job, isLoading: jobLoading, setJob } = useJob(jobId);
  const { stats, isLoading: statsLoading } = usePipelineStats(jobId);
  const { user } = useHRCurrentUser();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const [activeTab, setActiveTab] = React.useState<ApplicationStatus | undefined>(undefined);
  const { applications, isLoading: appsLoading, refetch } = useApplications(jobId, activeTab);
  const { submit: savePipeline, isLoading: isSavingPipeline, error: pipelineError } = useUpdateJobPipeline((updatedJob) => {
    setJob(updatedJob);
  });

  const [selectedApp, setSelectedApp] = React.useState<Application | null>(null);
  const [showUploadCV, setShowUploadCV] = React.useState(false);
  const [showPipelineConfig, setShowPipelineConfig] = React.useState(false);
 const [isSharepointModalOpen, setIsSharepointModalOpen] = useState(false);

  const handleStatCardClick = (status: ApplicationStatus | undefined) => {
    setActiveTab(status);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-slate-200 bg-white px-8 py-5">
        <Link href="/hr" className="mb-3 inline-flex items-center gap-1.5 text-[12px] text-slate-400 transition-colors hover:text-slate-600">
          <ArrowLeft size={13} />
          All Jobs
        </Link>

        {jobLoading ? (
          <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[20px] font-bold text-slate-800">{job?.title}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-4">
                <Meta icon={<Briefcase size={12} />} text={job?.department} />
                <Meta icon={<MapPin size={12} />} text={job?.location} />
                <Meta icon={<Users size={12} />} text={`${job?.headcount} opening${(job?.headcount ?? 0) > 1 ? "s" : ""}`} />
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                  job?.status === "Open"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-slate-100 text-slate-500 ring-slate-200"
                }`}>
                  {job?.status}
                </span>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onClick={() => setShowPipelineConfig(true)}>
                  <Settings2 size={13} />
                  Pipeline Settings
                </Button>
                <Button size="sm" className="gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => setShowUploadCV(true)}>
                  <Upload size={13} />
                  Upload CV
                </Button>
                <Button 
                  size="sm" 
                  className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700" 
                  onClick={() => setIsSharepointModalOpen(true)}
                >
                  <Upload size={13} /> {/* Or use a different icon like FolderSync */}
                  Bulk Import
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-8 py-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
          <StatsCard label="Total" value={stats?.total} accentClass="bg-slate-400" isLoading={statsLoading} isActive={activeTab === undefined} onClick={() => handleStatCardClick(undefined)} />
          <StatsCard label="Pending" value={stats?.pending} accentClass="bg-slate-300" isLoading={statsLoading} isActive={activeTab === "PENDING"} onClick={() => handleStatCardClick("PENDING")} />
          <StatsCard label="Screened" value={stats?.screened} accentClass="bg-emerald-500" isLoading={statsLoading} isActive={activeTab === "SCREENED"} onClick={() => handleStatCardClick("SCREENED")} />
          <StatsCard label="Scheduling" value={stats?.scheduling} accentClass="bg-purple-500" isLoading={statsLoading} isActive={activeTab === "SCHEDULING"} onClick={() => handleStatCardClick("SCHEDULING")} />
          <StatsCard label="Scheduled" value={stats?.scheduled} accentClass="bg-cyan-500" isLoading={statsLoading} isActive={activeTab === "SCHEDULED"} onClick={() => handleStatCardClick("SCHEDULED")} />
          <StatsCard label="Evaluating" value={stats?.evaluating} accentClass="bg-orange-500" isLoading={statsLoading} isActive={activeTab === "EVALUATING"} onClick={() => handleStatCardClick("EVALUATING")} />
          <StatsCard label="Rejected" value={stats?.rejected} accentClass="bg-red-400" isLoading={statsLoading} isActive={activeTab === "REJECTED"} onClick={() => handleStatCardClick("REJECTED")} />
        </div>
      </div>

      <div className="shrink-0 border-b border-slate-200 bg-white px-8">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = tab.status === activeTab;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.status)}
                className={isActive
                  ? "border-b-2 border-indigo-600 px-4 py-3 text-[13px] font-medium text-indigo-600"
                  : "border-b-2 border-transparent px-4 py-3 text-[13px] font-medium text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50 px-6 py-2">
          <div className="w-8 shrink-0" />
          <p className="flex-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Candidate</p>
          <p className="hidden w-24 shrink-0 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:block">Applied</p>
          <p className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">AI Score</p>
          <p className="w-28 shrink-0 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">Status</p>
          <div className="w-4 shrink-0" />
        </div>

        {appsLoading ? (
          <div className="flex items-center justify-center py-24 text-slate-400"><AsanaSpinner size="lg" /></div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <Inbox size={22} className="text-slate-400" />
            </div>
            <p className="text-[14px] font-medium text-slate-600">No applications</p>
            <p className="mt-1 text-[12px] text-slate-400">{activeTab ? `No candidates in ${activeTab.toLowerCase()} yet.` : "No candidates have applied to this job yet."}</p>
          </div>
        ) : (
          applications.map((app) => (
            <ApplicationRow key={app.id} application={app} onClick={setSelectedApp} isSelected={selectedApp?.id === app.id} />
          ))
        )}
      </div>

      {selectedApp && (
        <ApplicationDetailDrawer
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          userRole={user?.role ?? "user"}
          onStatusUpdated={() => {
            setSelectedApp(null);
            refetch();
          }}
        />
      )}

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

      <PipelineConfigDrawer
        isOpen={showPipelineConfig}
        onClose={() => setShowPipelineConfig(false)}
        initialValue={job?.pipelineConfig}
        onSave={async (pipelineConfig) => {
          await savePipeline(jobId, pipelineConfig);
          setShowPipelineConfig(false);
        }}
        isLoading={isSavingPipeline}
        error={pipelineError}
      />
      <SharepointSyncModal 
        jobId={jobId as string}
        isOpen={isSharepointModalOpen}
        onClose={() => setIsSharepointModalOpen(false)}
      />
    </div>
  );
}

const Meta: React.FC<{ icon: React.ReactNode; text?: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-1 text-[12px] text-slate-400">
    {icon}
    <span>{text ?? "-"}</span>
  </div>
);
