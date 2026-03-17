// src/app/hr/admin/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useJobs, useHRCurrentUser } from "@/hooks/useHRData";
import { getAllApplications } from "@/services/hrApiClient";
import { ApplicationDetailDrawer } from "@/components/hr/ApplicationDetailDrawer";
import { StatusBadge, AIScoreChip } from "@/components/hr/StatusBadge";
import { Application, Job } from "@/types/hr";
import {
  ShieldCheck,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle,
  BarChart2,
} from "lucide-react";

interface SummaryMetric {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}

export default function AdminPanelPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useHRCurrentUser();
  const { jobs, isLoading: jobsLoading } = useJobs();

  const [allApplications, setAllApplications] = React.useState<Application[]>([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const [selectedApp, setSelectedApp] = React.useState<Application | null>(null);

  React.useEffect(() => {
    if (!userLoading && user?.role !== "superadmin") {
      router.replace("/hr");
    }
  }, [user, userLoading, router]);

  React.useEffect(() => {
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

    fetchAll();
  }, []);

  const isLoading = userLoading || jobsLoading || isFetching;

  const biasFlagged = allApplications.filter((a) =>
    a.aiTags?.some((t) => t.includes("high-bias-divergence"))
  );

  const pendingReview = allApplications.filter(
    (a) => a.status === "ManualReview"
  );

  const scored = allApplications.filter((a) => a.aiScore !== null);
  const avgScore =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, a) => sum + (a.aiScore ?? 0), 0) / scored.length
        )
      : null;

  const passed = allApplications.filter((a) => a.status === "Passed").length;
  const passRate =
    allApplications.length > 0
      ? Math.round((passed / allApplications.length) * 100)
      : null;

  const metrics: SummaryMetric[] = [
    {
      label: "Total Applications",
      value: allApplications.length,
      icon: <Users size={18} />,
      colorClass: "text-indigo-500 bg-indigo-50",
    },
    {
      label: "Open Jobs",
      value: jobs.filter((j) => j.status === "Open").length,
      icon: <Briefcase size={18} />,
      colorClass: "text-blue-500 bg-blue-50",
    },
    {
      label: "Pending Review",
      value: pendingReview.length,
      icon: <AlertTriangle size={18} />,
      colorClass: "text-amber-500 bg-amber-50",
    },
    {
      label: "Bias Flags",
      value: biasFlagged.length,
      icon: <ShieldCheck size={18} />,
      colorClass: "text-orange-500 bg-orange-50",
    },
    {
      label: "Avg AI Score",
      value: avgScore ?? 0,
      icon: <BarChart2 size={18} />,
      colorClass: "text-emerald-500 bg-emerald-50",
    },
    {
      label: "Pass Rate %",
      value: passRate ?? 0,
      icon: <TrendingUp size={18} />,
      colorClass: "text-purple-500 bg-purple-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center">
          <ShieldCheck size={18} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-[20px] font-bold text-slate-800">Admin Panel</h1>
          <p className="text-[13px] text-slate-400">
            Full pipeline visibility - Superadmin only
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
          >
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center mb-3 ${m.colorClass}`}
            >
              {m.icon}
            </div>
            <p className="text-[22px] font-bold text-slate-800">{m.value}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {m.label}
            </p>
          </div>
        ))}
      </div>

      <Section title="Pipeline by Job" subtitle="Screening progress per open role">
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobPipelineRow
              key={job.id}
              job={job}
              applications={allApplications.filter((a) => a.jobId === job.id)}
            />
          ))}
          {jobs.length === 0 && <EmptyNote text="No jobs created yet." />}
        </div>
      </Section>

      <Section
        title="Bias-Flagged Applications"
        subtitle="Tier 3 detected a significant blind vs full score divergence (delta >= 15)"
        titleIcon={<AlertTriangle size={14} className="text-amber-500" />}
      >
        {biasFlagged.length === 0 ? (
          <EmptyNote
            text="No bias flags detected."
            icon={<CheckCircle size={16} className="text-emerald-500" />}
          />
        ) : (
          <div className="rounded-xl border border-amber-100 overflow-hidden divide-y divide-amber-50">
            {biasFlagged.map((app) => (
              <FlaggedRow
                key={app.id}
                application={app}
                job={jobs.find((j) => j.id === app.jobId)}
                onClick={() => setSelectedApp(app)}
              />
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Manual Review Queue"
        subtitle="Applications the AI could not confidently decide on"
      >
        {pendingReview.length === 0 ? (
          <EmptyNote
            text="Review queue is empty."
            icon={<CheckCircle size={16} className="text-emerald-500" />}
          />
        ) : (
          <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {pendingReview.map((app) => (
              <FlaggedRow
                key={app.id}
                application={app}
                job={jobs.find((j) => j.id === app.jobId)}
                onClick={() => setSelectedApp(app)}
              />
            ))}
          </div>
        )}
      </Section>

      {selectedApp && (
        <ApplicationDetailDrawer
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          userRole="superadmin"
          onStatusUpdated={() => {
            setAllApplications((prev) =>
              prev.filter((a) => a.id !== selectedApp.id)
            );
            setSelectedApp(null);
          }}
        />
      )}
    </div>
  );
}

const JobPipelineRow: React.FC<{
  job: Job;
  applications: Application[];
}> = ({ job, applications }) => {
  const total = applications.length;
  const passed = applications.filter((a) => a.status === "Passed").length;
  const manual = applications.filter((a) => a.status === "ManualReview").length;
  const rejected = applications.filter((a) => a.status === "Rejected").length;
  const pending = total - passed - manual - rejected;

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[14px] font-semibold text-slate-700">{job.title}</p>
          <p className="text-[12px] text-slate-400">
            {job.department} - {total} applicant{total !== 1 ? "s" : ""}
          </p>
        </div>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ring-1 ring-inset ${
            job.status === "Open"
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-slate-100 text-slate-500 ring-slate-200"
          }`}
        >
          {job.status}
        </span>
      </div>

      {total > 0 ? (
        <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 gap-px">
          {passed > 0 && (
            <div
              className="bg-emerald-400 transition-all"
              style={{ width: `${pct(passed)}%` }}
              title={`Passed: ${passed}`}
            />
          )}
          {manual > 0 && (
            <div
              className="bg-amber-400 transition-all"
              style={{ width: `${pct(manual)}%` }}
              title={`Manual: ${manual}`}
            />
          )}
          {rejected > 0 && (
            <div
              className="bg-red-400 transition-all"
              style={{ width: `${pct(rejected)}%` }}
              title={`Rejected: ${rejected}`}
            />
          )}
          {pending > 0 && (
            <div
              className="bg-slate-300 transition-all"
              style={{ width: `${pct(pending)}%` }}
              title={`Pending: ${pending}`}
            />
          )}
        </div>
      ) : (
        <div className="h-2 rounded-full bg-slate-100" />
      )}

      <div className="flex items-center gap-4 mt-2">
        <LegendItem color="bg-emerald-400" label="Passed" count={passed} />
        <LegendItem color="bg-amber-400" label="Review" count={manual} />
        <LegendItem color="bg-red-400" label="Rejected" count={rejected} />
        <LegendItem color="bg-slate-300" label="Pending" count={pending} />
      </div>
    </div>
  );
};

const FlaggedRow: React.FC<{
  application: Application;
  job?: Job;
  onClick: () => void;
}> = ({ application, job, onClick }) => {
  const candidate = application.candidate;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-amber-50/50 transition-colors"
    >
      <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[12px] font-semibold shrink-0">
        {candidate ? `${candidate.firstName[0]}${candidate.lastName[0]}` : "?"}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-slate-800 truncate">
          {candidate
            ? `${candidate.firstName} ${candidate.lastName}`
            : "Unknown"}
        </p>
        <p className="text-[12px] text-slate-400 truncate">
          {job?.title ?? "Unknown Job"} - {candidate?.email}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <AIScoreChip score={application.aiScore} />
        <StatusBadge status={application.status} />
      </div>

      <div className="hidden lg:flex items-center gap-1.5 shrink-0">
        {application.aiTags?.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 ring-1 ring-orange-200 font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

const Section: React.FC<{
  title: string;
  subtitle?: string;
  titleIcon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, titleIcon, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      {titleIcon}
      <div>
        <h2 className="text-[15px] font-semibold text-slate-700">{title}</h2>
        {subtitle && <p className="text-[12px] text-slate-400">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const LegendItem: React.FC<{
  color: string;
  label: string;
  count: number;
}> = ({ color, label, count }) => (
  <div className="flex items-center gap-1">
    <div className={`h-2 w-2 rounded-full ${color}`} />
    <span className="text-[11px] text-slate-400">{label}: {count}</span>
  </div>
);

const EmptyNote: React.FC<{
  text: string;
  icon?: React.ReactNode;
}> = ({ text, icon }) => (
  <div className="flex items-center gap-2 py-4 px-4 text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
    {icon}
    <p className="text-[13px]">{text}</p>
  </div>
);
