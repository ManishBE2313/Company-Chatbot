// src/app/hr/applications/page.tsx
"use client";

import * as React from "react";
import { useJobs, useHRCurrentUser } from "@/hooks/useHRData";
import { getAllApplications } from "@/services/hrApiClient";
import { ApplicationRow } from "@/components/hr/ApplicationRow";
import { ApplicationDetailDrawer } from "@/components/hr/ApplicationDetailDrawer";
import { Application, ApplicationStatus, Job } from "@/types/hr";
import { cn } from "@/utils/classNames";
import { AsanaSpinner } from "@/components/ui/AsanaSpinner";
import { Search, Filter, Inbox, ChevronDown } from "lucide-react";

const STATUS_OPTIONS: { label: string; value: ApplicationStatus | "All" }[] = [
  { label: "All Statuses", value: "All" },
  { label: "Pending", value: "Pending" },
  { label: "Passed", value: "Passed" },
  { label: "Rejected", value: "Rejected" },
  { label: "Manual Review", value: "ManualReview" },
  { label: "Interviewing", value: "Interviewing" },
  { label: "Offered", value: "Offered" },
];

export default function AllApplicationsPage() {
  const { jobs, isLoading: jobsLoading } = useJobs();
  const { user } = useHRCurrentUser();

  const [allApplications, setAllApplications] = React.useState<Application[]>([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const [selectedApp, setSelectedApp] = React.useState<Application | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ApplicationStatus | "All">("All");
  const [jobFilter, setJobFilter] = React.useState<string>("All");

  React.useEffect(() => {
    const fetchAll = async () => {
      setIsFetching(true);
      try {
        const applications = await getAllApplications();
        setAllApplications(applications);
      } catch (e) {
        console.error("Failed to fetch applications:", e);
      } finally {
        setIsFetching(false);
      }
    };

    fetchAll();
  }, []);

  const filtered = React.useMemo(() => {
    return allApplications.filter((app) => {
      const fullName = app.candidate
        ? `${app.candidate.firstName} ${app.candidate.lastName}`.toLowerCase()
        : "";
      const email = app.candidate?.email?.toLowerCase() ?? "";
      const matchesSearch =
        search.trim() === "" ||
        fullName.includes(search.toLowerCase()) ||
        email.includes(search.toLowerCase());

      const matchesStatus = statusFilter === "All" || app.status === statusFilter;
      const matchesJob = jobFilter === "All" || app.jobId === jobFilter;

      return matchesSearch && matchesStatus && matchesJob;
    });
  }, [allApplications, search, statusFilter, jobFilter]);

  const isLoading = jobsLoading || isFetching;

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 bg-white border-b border-slate-200 px-8 py-5">
        <h1 className="text-[20px] font-bold text-slate-800">All Applications</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">
          {isLoading
            ? "Loading..."
            : `${filtered.length} application${filtered.length !== 1 ? "s" : ""} across ${jobs.length} job${jobs.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="shrink-0 bg-white border-b border-slate-100 px-8 py-3 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-colors"
          />
        </div>

        <FilterSelect
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as ApplicationStatus | "All")}
          options={STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          icon={<Filter size={13} />}
        />

        <FilterSelect
          value={jobFilter}
          onChange={setJobFilter}
          options={[
            { label: "All Jobs", value: "All" },
            ...jobs.map((j) => ({ label: j.title, value: j.id })),
          ]}
          icon={<ChevronDown size={13} />}
        />
      </div>

      <div className="shrink-0 flex items-center gap-4 px-6 py-2 border-b border-slate-100 bg-slate-50">
        <div className="w-8 shrink-0" />
        <p className="flex-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Candidate</p>
        <p className="hidden sm:block text-[11px] font-semibold text-slate-400 uppercase tracking-wide w-32">Job</p>
        <p className="hidden sm:block text-[11px] font-semibold text-slate-400 uppercase tracking-wide w-24 text-right">Applied</p>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide shrink-0">AI Score</p>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide w-28 text-right">Status</p>
        <div className="w-4 shrink-0" />
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <AsanaSpinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
              <Inbox size={22} className="text-slate-400" />
            </div>
            <p className="text-[14px] font-medium text-slate-600">No applications found</p>
            <p className="text-[12px] text-slate-400 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          filtered.map((app) => (
            <ApplicationRowWithJob
              key={app.id}
              application={app}
              job={jobs.find((j) => j.id === app.jobId)}
              onClick={setSelectedApp}
              isSelected={selectedApp?.id === app.id}
            />
          ))
        )}
      </div>

      {selectedApp && (
        <ApplicationDetailDrawer
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          userRole={user?.role ?? "user"}
          onStatusUpdated={() => {
            setAllApplications((prev) =>
              prev.map((a) =>
                a.id === selectedApp.id ? { ...a, status: selectedApp.status } : a
              )
            );
            setSelectedApp(null);
          }}
        />
      )}
    </div>
  );
}

const ApplicationRowWithJob: React.FC<{
  application: Application;
  job?: Job;
  onClick: (app: Application) => void;
  isSelected?: boolean;
}> = ({ application, job, onClick, isSelected }) => (
  <div className="relative">
    <ApplicationRow application={application} onClick={onClick} isSelected={isSelected} />
    {job && (
      <span className="hidden sm:block absolute top-1/2 -translate-y-1/2 left-[calc(1.5rem+8px+1rem+200px)] text-[12px] text-slate-400 w-32 truncate pointer-events-none">
        {job.title}
      </span>
    )}
  </div>
);

const FilterSelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  icon?: React.ReactNode;
}> = ({ value, onChange, options, icon }) => (
  <div className="relative">
    {icon && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</span>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pr-7 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-colors cursor-pointer",
        icon ? "pl-7" : "pl-3"
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
  </div>
);
