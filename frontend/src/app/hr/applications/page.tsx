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
  { label: "Pending", value: "PENDING" },
  { label: "Screened", value: "SCREENED" },
  { label: "Scheduling", value: "SCHEDULING" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Evaluating", value: "EVALUATING" },
  { label: "Offered", value: "OFFERED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Withdrawn", value: "WITHDRAWN" },
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
      const fullName = app.candidate ? `${app.candidate.firstName} ${app.candidate.lastName}`.toLowerCase() : "";
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
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-[20px] font-bold text-slate-800">All Applications</h1>
        <p className="mt-0.5 text-[13px] text-slate-400">
          {isLoading
            ? "Loading..."
            : `${filtered.length} application${filtered.length !== 1 ? "s" : ""} across ${jobs.length} job${jobs.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="shrink-0 flex flex-wrap items-center gap-3 border-b border-slate-100 bg-white px-8 py-3">
        <div className="relative max-w-sm min-w-[200px] flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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
          options={[{ label: "All Jobs", value: "All" }, ...jobs.map((j) => ({ label: j.title, value: j.id }))]}
          icon={<ChevronDown size={13} />}
        />
      </div>

      <div className="shrink-0 flex items-center gap-4 border-b border-slate-100 bg-slate-50 px-6 py-2">
        <div className="w-8 shrink-0" />
        <p className="flex-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Candidate</p>
        <p className="hidden w-32 text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:block">Job</p>
        <p className="hidden w-24 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:block">Applied</p>
        <p className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">AI Score</p>
        <p className="w-28 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">Status</p>
        <div className="w-4 shrink-0" />
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-slate-400"><AsanaSpinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100"><Inbox size={22} className="text-slate-400" /></div>
            <p className="text-[14px] font-medium text-slate-600">No applications found</p>
            <p className="mt-1 text-[12px] text-slate-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          filtered.map((app) => (
            <ApplicationRowWithJob key={app.id} application={app} job={jobs.find((j) => j.id === app.jobId)} onClick={setSelectedApp} isSelected={selectedApp?.id === app.id} />
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
      <span className="pointer-events-none absolute left-[calc(1.5rem+8px+1rem+200px)] top-1/2 hidden w-32 -translate-y-1/2 truncate text-[12px] text-slate-400 sm:block">
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
    {icon && <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "cursor-pointer appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pr-7 text-[13px] text-slate-700 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40",
        icon ? "pl-7" : "pl-3"
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
  </div>
);
