"use client";

import React, { useEffect, useMemo, useState } from "react";
import RoleManagementSection from "@/components/hr/RoleManagementSection";
import { CreateJobModal } from "@/components/hr/CreateJobModal";
import { Button } from "@/components/ui/Button";
import { AsanaSpinner } from "@/components/ui/AsanaSpinner";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import {
  analyzeJobDescription,
  createJobDescriptionTemplate,
  createSettingsSkill,
  getJobDescriptionTemplates,
  getJobFormCatalog,
  getSettingsSkills,
  getSuggestion,
} from "@/services/hrApiClient";
import { useHRCurrentUser } from "@/hooks/useHRData";
import {
  Job,
  JobDescriptionTemplate,
  JobFormCatalog,
  SkillCatalog,
  UserRole,
} from "@/types/hr";
import {
  AlertCircle,
  CheckCircle,
  PencilLine,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

export default function CompanySettingsPage() {
  const [activeTab, setActiveTab] = useState<"roles" | "review-jobs" | "skills" | "job-descriptions">("roles");
  const { user, isLoading: isUserLoading } = useHRCurrentUser();

  if (isUserLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <AsanaSpinner size="lg" className="text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 text-slate-500">
        Unable to load user profile.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Company Settings</h1>
          <p className="text-sm text-gray-500">Manage roles, review draft jobs, maintain skills, and curate reusable job descriptions.</p>
        </div>
      </header>

      <div className="border-b border-gray-200 px-8">
        <nav className="-mb-px flex flex-wrap gap-x-8">
          {[
            ["roles", "Assign Roles"],
            ["review-jobs", "Review Draft Jobs"],
            ["skills", "Skills"],
            ["job-descriptions", "Job Descriptions"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setActiveTab(value as typeof activeTab)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                activeTab === value
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">
          {activeTab === "roles" && (
            <RoleManagementSection
              currentUserEmail={user.email}
              currentUserRole={user.role as UserRole}
            />
          )}
          {activeTab === "review-jobs" && <ReviewDraftJobsSection />}
          {activeTab === "skills" && <SkillsSection />}
          {activeTab === "job-descriptions" && <JobDescriptionsSection />}
        </div>
      </div>
    </div>
  );
}

function SkillsSection() {
  const [skills, setSkills] = useState<SkillCatalog[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("custom");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const loadSkills = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setSkills(await getSettingsSkills());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch skills.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSkills();
  }, []);

  const filteredSkills = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return skills;
    return skills.filter((skill) => skill.name.toLowerCase().includes(query) || skill.category.toLowerCase().includes(query));
  }, [search, skills]);

  const handleSuggest = async () => {
    if (!name.trim()) return;
    setIsSuggesting(true);
    try {
      const result = await getSuggestion({ input: name, kind: "skill" });
      setName(result.result || name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to normalize skill name.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      await createSettingsSkill({ name, category });
      setName("");
      setCategory("custom");
      await loadSkills();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create skill.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500">Skill Library</p>
            <h2 className="mt-1 text-[18px] font-semibold text-slate-800">Manage Shared Skills</h2>
            <p className="mt-1 text-[13px] text-slate-400">Add new reusable skills once so they become available across job descriptions and job creation.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-2 text-[12px] font-semibold text-slate-600">
            {skills.length} skill{skills.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_0.8fr_auto_auto]">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="New skill name" />
          <input className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
          <Button variant="outline" onClick={() => void handleSuggest()} isLoading={isSuggesting} className="gap-1.5">
            <WandSparkles size={14} />
            Suggest
          </Button>
          <Button onClick={() => void handleSave()} isLoading={isSaving} className="bg-indigo-600 text-white hover:bg-indigo-700">
            Add Skill
          </Button>
        </div>

        <div className="mt-3">
          <input className={inputCls} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search skills or categories" />
        </div>

        {error && <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>}
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
          <AsanaSpinner size="lg" className="text-indigo-500" />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredSkills.map((skill) => (
            <div key={skill.id} className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[14px] font-semibold text-slate-800">{skill.name}</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                  {skill.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function JobDescriptionsSection() {
  const [catalog, setCatalog] = useState<JobFormCatalog | null>(null);
  const [templates, setTemplates] = useState<JobDescriptionTemplate[]>([]);
  const [title, setTitle] = useState("");
  const [jobRoleId, setJobRoleId] = useState("");
  const [description, setDescription] = useState("");
  const [refinedDescription, setRefinedDescription] = useState("");
  const [mustHaveSkillIds, setMustHaveSkillIds] = useState<string[]>([]);
  const [niceToHaveSkillIds, setNiceToHaveSkillIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [catalogData, templateData] = await Promise.all([
        getJobFormCatalog(),
        getJobDescriptionTemplates(),
      ]);
      setCatalog(catalogData);
      setTemplates(templateData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load job description data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const availableMustSkills = useMemo(
    () => (catalog?.skills || []).filter((skill) => !mustHaveSkillIds.includes(skill.id)),
    [catalog, mustHaveSkillIds]
  );

  const availableNiceSkills = useMemo(
    () => (catalog?.skills || []).filter((skill) => !niceToHaveSkillIds.includes(skill.id)),
    [catalog, niceToHaveSkillIds]
  );

  const getSkillName = (skillId: string) => catalog?.skills.find((skill) => skill.id === skillId)?.name || skillId;

  const setSkillsFromNames = (mustNames: string[], niceNames: string[]) => {
    const skillMap = new Map((catalog?.skills || []).map((skill) => [skill.name.toLowerCase(), skill.id]));
    setMustHaveSkillIds(mustNames.map((name) => skillMap.get(name.toLowerCase())).filter(Boolean) as string[]);
    setNiceToHaveSkillIds(niceNames.map((name) => skillMap.get(name.toLowerCase())).filter(Boolean) as string[]);
  };

  const handleAnalyze = async () => {
    if (!title.trim() || !description.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeJobDescription({ title, description });
      setRefinedDescription(result.refinedDescription || "");
      setSkillsFromNames(result.mustHaveSkills || [], result.niceToHaveSkills || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze job description.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSuggest = async () => {
    if (!description.trim()) return;
    setIsSuggesting(true);
    setError(null);
    try {
      const result = await getSuggestion({ input: description, kind: "description" });
      setRefinedDescription(result.result || description);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to suggest rewrite.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      await createJobDescriptionTemplate({
        title,
        jobRoleId: jobRoleId || null,
        description,
        refinedDescription: refinedDescription || undefined,
        mustHaveSkillIds,
        niceToHaveSkillIds,
      });
      setTitle("");
      setJobRoleId("");
      setDescription("");
      setRefinedDescription("");
      setMustHaveSkillIds([]);
      setNiceToHaveSkillIds([]);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save job description.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
        <AsanaSpinner size="lg" className="text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500">JD Library</p>
            <h2 className="mt-1 text-[18px] font-semibold text-slate-800">Create Reusable Job Descriptions</h2>
            <p className="mt-1 text-[13px] text-slate-400">Analyze a job description against your skill catalog, refine it, and save it as an importable template.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-2 text-[12px] font-semibold text-slate-600">
            {templates.length} template{templates.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-3">
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Template title" />
            <select className={inputCls} value={jobRoleId} onChange={(e) => setJobRoleId(e.target.value)}>
              <option value="">Link to job role (optional but recommended)</option>
              {catalog?.jobRoles.map((role) => (
                <option key={role.id} value={role.id}>{role.title}</option>
              ))}
            </select>
            <textarea className={inputCls + " min-h-[180px] resize-none"} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Paste or write the job description here" />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void handleSuggest()} isLoading={isSuggesting} className="gap-1.5">
                <WandSparkles size={14} />
                Refine Wording
              </Button>
              <Button onClick={() => void handleAnalyze()} isLoading={isAnalyzing} className="bg-indigo-600 text-white hover:bg-indigo-700 gap-1.5">
                <Sparkles size={14} />
                Analyze Skills
              </Button>
              <Button onClick={() => void handleSave()} isLoading={isSaving} className="bg-slate-800 text-white hover:bg-slate-900">
                Save Template
              </Button>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Refined Description</p>
              <p className="mt-2 whitespace-pre-wrap text-[13px] text-slate-600">{refinedDescription || "Run AI refinement or analysis to generate a polished reusable version."}</p>
            </div>
            <TemplateSkillBucket
              title="Must-Have Skills"
              selectedSkillIds={mustHaveSkillIds}
              availableSkills={availableMustSkills}
              getSkillName={getSkillName}
              onAdd={(skillId) => setMustHaveSkillIds((current) => current.includes(skillId) ? current : [...current, skillId])}
              onRemove={(skillId) => setMustHaveSkillIds((current) => current.filter((id) => id !== skillId))}
            />
            <TemplateSkillBucket
              title="Nice-To-Have Skills"
              selectedSkillIds={niceToHaveSkillIds}
              availableSkills={availableNiceSkills}
              getSkillName={getSkillName}
              onAdd={(skillId) => setNiceToHaveSkillIds((current) => current.includes(skillId) ? current : [...current, skillId])}
              onRemove={(skillId) => setNiceToHaveSkillIds((current) => current.filter((id) => id !== skillId))}
            />
          </div>
        </div>

        {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>}
      </div>

      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        {templates.map((template) => (
          <div key={template.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-slate-800">{template.title}</h3>
                <p className="mt-1 text-[12px] text-slate-500">{template.jobRole?.title || "Unlinked template"}</p>
              </div>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700">
                JD
              </span>
            </div>
            <p className="mt-3 line-clamp-4 text-[12px] text-slate-600">{template.refinedDescription || template.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(template.mustHaveSkills || []).slice(0, 6).map((skill) => (
                <span key={skill.id} className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-[10px] font-medium text-indigo-700">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewDraftJobsSection() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const fetchDraftJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/hr/jobs?reviewStatus=needs_review");
      const data = await res.json();
      if (res.ok) {
        setJobs(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch draft jobs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchDraftJobs();
  }, []);

  const handleApprove = async (jobId: string) => {
    setProcessingId(jobId);
    try {
      const res = await fetch(`/api/hr/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Open", reviewStatus: "approved" }),
      });

      if (res.ok) {
        setJobs((current) => current.filter((job) => job.id !== jobId));
      }
    } catch (err) {
      console.error("Error approving job:", err);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
        <AsanaSpinner size="lg" className="text-indigo-500" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <ShieldCheck className="mb-4 h-12 w-12 text-green-400" />
        <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
        <p className="mt-2 text-gray-500">There are no drafted jobs waiting for HR review.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500">HR Review Queue</p>
          <h2 className="mt-1 text-[18px] font-semibold text-slate-800">Draft Job Requests</h2>
          <p className="mt-1 text-[13px] text-slate-400">Review, refine, and publish requests without leaving Company Settings.</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-2 text-[12px] font-semibold text-slate-600">
          {jobs.length} pending request{jobs.length > 1 ? "s" : ""}
        </div>
      </div>

      <div className="max-h-[72vh] overflow-y-auto pr-1">
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {jobs.map((job) => (
            <div key={job.id} className="overflow-hidden rounded-3xl border border-yellow-200 bg-white shadow-sm">
              <div className="border-b border-yellow-100 bg-yellow-50 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <h3 className="text-[15px] font-semibold text-slate-900">{job.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-full bg-yellow-200 px-2 py-0.5 font-semibold text-yellow-800">Needs Review</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-slate-600 ring-1 ring-inset ring-slate-200">{job.department}</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-slate-600 ring-1 ring-inset ring-slate-200">{job.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">AI</p>
                    <p className={`text-lg font-bold ${Number(job.aiMatchPercentage ?? 0) < 50 ? "text-red-600" : "text-yellow-600"}`}>
                      {job.aiMatchPercentage ?? 0}%
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-[12px] text-slate-500">
                  Requested by <span className="font-medium text-slate-700">{job.createdBy?.email || "Unknown Manager"}</span>
                </p>
              </div>

              <div className="space-y-3 px-4 py-4">
                <div className="grid grid-cols-2 gap-2 text-[12px] text-slate-500">
                  <div className="rounded-2xl bg-slate-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Level</p>
                    <p className="mt-1 font-medium text-slate-700">{job.seniorityLevel || "Unspecified"}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Headcount</p>
                    <p className="mt-1 font-medium text-slate-700">{job.headcount}</p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Requirements</h4>
                  <div className="max-h-32 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-600">
                    {Array.isArray(job.criteria?.requirements?.mustHaveSkills) && (job.criteria?.requirements?.mustHaveSkills as string[]).length > 0
                      ? (job.criteria?.requirements?.mustHaveSkills as string[]).join(", ")
                      : typeof job.criteria?.requirements?.rawText === "string"
                        ? job.criteria.requirements.rawText
                        : "No description provided."}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
                <Button variant="outline" size="sm" onClick={() => setEditingJob(job)} className="gap-1.5">
                  <PencilLine size={14} />
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() => void handleApprove(job.id)}
                  disabled={processingId === job.id}
                  className="gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {processingId === job.id ? <AsanaSpinner size="sm" /> : <CheckCircle className="h-4 w-4" />}
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingJob && (
        <CreateJobModal
          mode="edit"
          jobToEdit={editingJob}
          onClose={() => setEditingJob(null)}
          onCreated={() => {
            setEditingJob(null);
            void fetchDraftJobs();
          }}
        />
      )}
    </>
  );
}

function TemplateSkillBucket({
  title,
  selectedSkillIds,
  availableSkills,
  getSkillName,
  onAdd,
  onRemove,
}: {
  title: string;
  selectedSkillIds: string[];
  availableSkills: SkillCatalog[];
  getSkillName: (skillId: string) => string;
  onAdd: (skillId: string) => void;
  onRemove: (skillId: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</p>
        <SearchableDropdown options={availableSkills} onSelect={onAdd} placeholder="+ add skill" />
      </div>
      <div className="flex min-h-[48px] flex-wrap gap-2">
        {selectedSkillIds.length === 0 && <p className="text-[12px] text-slate-400">No skills selected yet.</p>}
        {selectedSkillIds.map((skillId) => (
          <button
            key={skillId}
            type="button"
            onClick={() => onRemove(skillId)}
            className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[12px] font-medium text-indigo-700"
          >
            {getSkillName(skillId)}
          </button>
        ))}
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40";


