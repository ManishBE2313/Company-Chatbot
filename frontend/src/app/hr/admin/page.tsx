"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useJobs, useHRCurrentUser } from "@/hooks/useHRData";
import { getAllApplications } from "@/services/hrApiClient";
import { ApplicationDetailDrawer } from "@/components/hr/ApplicationDetailDrawer";
import { StatusBadge, AIScoreChip } from "@/components/hr/StatusBadge";
import { AsanaSpinner } from "@/components/ui/AsanaSpinner";
import RoleManagementSection from "@/components/hr/RoleManagementSection";
import { Application, Job } from "@/types/hr";
import { ShieldCheck, AlertTriangle, TrendingUp, Users, Briefcase, CheckCircle, BarChart2 } from "lucide-react";

interface SummaryMetric {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}

export default function AdminPanelPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useHRCurrentUser();
  const isPrivileged = user?.role === "admin" || user?.role === "superadmin";
  const isSuperadmin = user?.role === "superadmin";
  const { jobs, isLoading: jobsLoading } = useJobs();

  const [allApplications, setAllApplications] = React.useState<Application[]>([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const [selectedApp, setSelectedApp] = React.useState<Application | null>(null);

  React.useEffect(() => {
    if (!userLoading && !isPrivileged) {
      router.replace("/hr");
    }
  }, [isPrivileged, userLoading, router]);

  React.useEffect(() => {
    if (!isSuperadmin) {
      return;
    }

    const fetchAll = async () => {
      setIsFetching(true);
      try {
        const applications = await getAllApplications();
        setAllApplications(applications);
      } catch (e) {
        console.error("Admin fetch failed:", e);
      } finally {
        setIsFetching(false);
      }
    };

    void fetchAll();
  }, [isSuperadmin]);

  const isLoading = userLoading || (isSuperadmin && (jobsLoading || isFetching));

  const biasFlagged = allApplications.filter((a) => a.aiTags?.some((t) => t.includes("high-bias-divergence")));
  const evaluatingQueue = allApplications.filter((a) => a.status === "EVALUATING");
  const scheduled = allApplications.filter((a) => a.status === "SCHEDULED").length;
  const scored = allApplications.filter((a) => a.aiScore !== null);
  const avgScore = scored.length > 0 ? Math.round(scored.reduce((sum, a) => sum + (a.aiScore ?? 0), 0) / scored.length) : 0;
  const screened = allApplications.filter((a) => a.status === "SCREENED").length;
  const screenRate = allApplications.length > 0 ? Math.round((screened / allApplications.length) * 100) : 0;

  const metrics: SummaryMetric[] = [
    { label: "Total Applications", value: allApplications.length, icon: <Users size={18} />, colorClass: "text-indigo-500 bg-indigo-50" },
    { label: "Open Jobs", value: jobs.filter((j) => j.status === "Open").length, icon: <Briefcase size={18} />, colorClass: "text-blue-500 bg-blue-50" },
    { label: "Evaluating", value: evaluatingQueue.length, icon: <AlertTriangle size={18} />, colorClass: "text-amber-500 bg-amber-50" },
    { label: "Scheduled", value: scheduled, icon: <ShieldCheck size={18} />, colorClass: "text-cyan-500 bg-cyan-50" },
    { label: "Avg AI Score", value: avgScore, icon: <BarChart2 size={18} />, colorClass: "text-emerald-500 bg-emerald-50" },
    { label: "Screen Rate %", value: screenRate, icon: <TrendingUp size={18} />, colorClass: "text-purple-500 bg-purple-50" },
  ];

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-slate-400"><AsanaSpinner size="lg" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-8 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
          <ShieldCheck size={18} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-[20px] font-bold text-slate-800">Admin Workspace</h1>
          <p className="text-[13px] text-slate-400">
            {isSuperadmin ? "Pipeline visibility and access governance" : "Access governance and role assignment"}
          </p>
        </div>
      </div>

      {user?.email && <RoleManagementSection currentUserEmail={user.email} currentUserRole={user.role} />}

      {isSuperadmin && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${m.colorClass}`}>{m.icon}</div>
                <p className="text-[22px] font-bold text-slate-800">{m.value}</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">{m.label}</p>
              </div>
            ))}
          </div>

          <Section title="Pipeline by Job" subtitle="Progress by scheduling stage for each role">
            <div className="space-y-3">
              {jobs.map((job) => <JobPipelineRow key={job.id} job={job} applications={allApplications.filter((a) => a.jobId === job.id)} />)}
              {jobs.length === 0 && <EmptyNote text="No jobs created yet." />}
            </div>
          </Section>

          <Section title="Bias-Flagged Applications" subtitle="Tier 3 detected a significant blind vs full score divergence" titleIcon={<AlertTriangle size={14} className="text-amber-500" />}>
            {biasFlagged.length === 0 ? <EmptyNote text="No bias flags detected." icon={<CheckCircle size={16} className="text-emerald-500" />} /> : (
              <div className="overflow-hidden rounded-xl border border-amber-100 divide-y divide-amber-50">
                {biasFlagged.map((app) => <FlaggedRow key={app.id} application={app} job={jobs.find((j) => j.id === app.jobId)} onClick={() => setSelectedApp(app)} />)}
              </div>
            )}
          </Section>

          <Section title="Evaluating Queue" subtitle="Candidates waiting on HR after interviewer feedback">
            {evaluatingQueue.length === 0 ? <EmptyNote text="No candidates are waiting in evaluating right now." icon={<CheckCircle size={16} className="text-emerald-500" />} /> : (
              <div className="overflow-hidden rounded-xl border border-slate-200 divide-y divide-slate-100">
                {evaluatingQueue.map((app) => <FlaggedRow key={app.id} application={app} job={jobs.find((j) => j.id === app.jobId)} onClick={() => setSelectedApp(app)} />)}
              </div>
            )}
          </Section>
        </>
      )}

      {selectedApp && (
        <ApplicationDetailDrawer
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          userRole="superadmin"
          onStatusUpdated={() => {
            setSelectedApp(null);
          }}
        />
      )}
    </div>
  );
}

const JobPipelineRow: React.FC<{ job: Job; applications: Application[] }> = ({ job, applications }) => {
  const total = applications.length;
  const screened = applications.filter((a) => a.status === "SCREENED").length;
  const scheduling = applications.filter((a) => a.status === "SCHEDULING").length;
  const scheduled = applications.filter((a) => a.status === "SCHEDULED").length;
  const evaluating = applications.filter((a) => a.status === "EVALUATING").length;
  const rejected = applications.filter((a) => a.status === "REJECTED").length;
  const pending = total - screened - scheduling - scheduled - evaluating - rejected;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[14px] font-semibold text-slate-700">{job.title}</p>
          <p className="text-[12px] text-slate-400">{job.department} - {total} applicant{total !== 1 ? "s" : ""}</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${job.status === "Open" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-500 ring-slate-200"}`}>{job.status}</span>
      </div>

      {total > 0 ? (
        <div className="flex h-2 gap-px overflow-hidden rounded-full bg-slate-100">
          {screened > 0 && <div className="bg-emerald-400" style={{ width: `${pct(screened)}%` }} title={`Screened: ${screened}`} />}
          {scheduling > 0 && <div className="bg-purple-400" style={{ width: `${pct(scheduling)}%` }} title={`Scheduling: ${scheduling}`} />}
          {scheduled > 0 && <div className="bg-cyan-400" style={{ width: `${pct(scheduled)}%` }} title={`Scheduled: ${scheduled}`} />}
          {evaluating > 0 && <div className="bg-orange-400" style={{ width: `${pct(evaluating)}%` }} title={`Evaluating: ${evaluating}`} />}
          {rejected > 0 && <div className="bg-red-400" style={{ width: `${pct(rejected)}%` }} title={`Rejected: ${rejected}`} />}
          {pending > 0 && <div className="bg-slate-300" style={{ width: `${pct(pending)}%` }} title={`Pending: ${pending}`} />}
        </div>
      ) : (
        <div className="h-2 rounded-full bg-slate-100" />
      )}

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <LegendItem color="bg-emerald-400" label="Screened" count={screened} />
        <LegendItem color="bg-purple-400" label="Scheduling" count={scheduling} />
        <LegendItem color="bg-cyan-400" label="Scheduled" count={scheduled} />
        <LegendItem color="bg-orange-400" label="Evaluating" count={evaluating} />
        <LegendItem color="bg-red-400" label="Rejected" count={rejected} />
        <LegendItem color="bg-slate-300" label="Pending" count={pending} />
      </div>
    </div>
  );
};

const FlaggedRow: React.FC<{ application: Application; job?: Job; onClick: () => void }> = ({ application, job, onClick }) => {
  const candidate = application.candidate;

  return (
    <div onClick={onClick} className="flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-amber-50/50">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[12px] font-semibold text-amber-700">
        {candidate ? `${candidate.firstName[0]}${candidate.lastName[0]}` : "?"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-slate-800">{candidate ? `${candidate.firstName} ${candidate.lastName}` : "Unknown"}</p>
        <p className="truncate text-[12px] text-slate-400">{job?.title ?? "Unknown Job"} - {candidate?.email}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <AIScoreChip score={application.aiScore} />
        <StatusBadge status={application.status} />
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; subtitle?: string; titleIcon?: React.ReactNode; children: React.ReactNode }> = ({ title, subtitle, titleIcon, children }) => (
  <div>
    <div className="mb-3 flex items-center gap-2">
      {titleIcon}
      <div>
        <h2 className="text-[15px] font-semibold text-slate-700">{title}</h2>
        {subtitle && <p className="text-[12px] text-slate-400">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const LegendItem: React.FC<{ color: string; label: string; count: number }> = ({ color, label, count }) => (
  <div className="flex items-center gap-1">
    <div className={`h-2 w-2 rounded-full ${color}`} />
    <span className="text-[11px] text-slate-400">{label}: {count}</span>
  </div>
);

const EmptyNote: React.FC<{ text: string; icon?: React.ReactNode }> = ({ text, icon }) => (
  <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 text-slate-400">
    {icon}
    <p className="text-[13px]">{text}</p>
  </div>
);
