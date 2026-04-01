"use client";

import * as React from "react";
import { useCreateJob } from "@/hooks/useHRData";
import { CreateJobPayload, JobFormCatalog } from "@/types/hr";
import { getJobFormCatalog } from "@/services/hrApiClient";
import { Button } from "@/components/ui/Button";
import { X, Sparkles } from "lucide-react";

interface CreateJobModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  onClose,
  onCreated,
}) => {
  const [catalog, setCatalog] = React.useState<JobFormCatalog | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = React.useState(true);
  const [catalogError, setCatalogError] = React.useState<string | null>(null);

  const [jobRoleId, setJobRoleId] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState("");
  const [locationId, setLocationId] = React.useState("");
  const [panelId, setPanelId] = React.useState("");
  const [headcount, setHeadcount] = React.useState(1);
  const [employmentType, setEmploymentType] = React.useState<"FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN">("FULL_TIME");
  const [workModel, setWorkModel] = React.useState<"ON_SITE" | "REMOTE" | "HYBRID">("HYBRID");
  const [seniorityLevel, setSeniorityLevel] = React.useState("Mid");
  const [experienceMin, setExperienceMin] = React.useState(2);
  const [experienceMax, setExperienceMax] = React.useState(5);
  const [salaryMin, setSalaryMin] = React.useState<number | "">("");
  const [salaryMax, setSalaryMax] = React.useState<number | "">("");
  const [currency, setCurrency] = React.useState("USD");
  const [payFrequency, setPayFrequency] = React.useState<"HOURLY" | "WEEKLY" | "MONTHLY" | "YEARLY">("YEARLY");
  const [salaryVisibility, setSalaryVisibility] = React.useState<"PUBLIC" | "INTERNAL" | "HIDDEN">("PUBLIC");
  const [educationLevel, setEducationLevel] = React.useState("Bachelor's");
  const [mustHaveSkillIds, setMustHaveSkillIds] = React.useState<string[]>([]);
  const [niceToHaveSkillIds, setNiceToHaveSkillIds] = React.useState<string[]>([]);
  const [notes, setNotes] = React.useState("");

  const { submit, isLoading, error } = useCreateJob(() => {
    onCreated();
    onClose();
  });

  React.useEffect(() => {
    const loadCatalog = async () => {
      setIsCatalogLoading(true);
      setCatalogError(null);
      try {
        const data = await getJobFormCatalog();
        setCatalog(data);
        if (data.departments[0]) setDepartmentId((current) => current || data.departments[0].id);
        if (data.locations[0]) setLocationId((current) => current || data.locations[0].id);
      } catch (catalogLoadError) {
        setCatalogError(catalogLoadError instanceof Error ? catalogLoadError.message : "Failed to load job form data.");
      } finally {
        setIsCatalogLoading(false);
      }
    };

    void loadCatalog();
  }, []);

  const selectedJobRole = React.useMemo(
    () => catalog?.jobRoles.find((role) => role.id === jobRoleId) || null,
    [catalog, jobRoleId]
  );

  const selectedDepartment = React.useMemo(
    () => catalog?.departments.find((department) => department.id === departmentId) || null,
    [catalog, departmentId]
  );

  const selectedLocation = React.useMemo(
    () => catalog?.locations.find((location) => location.id === locationId) || null,
    [catalog, locationId]
  );

  React.useEffect(() => {
    if (!selectedJobRole) {
      return;
    }

    setSeniorityLevel(selectedJobRole.level || "Mid");
    setExperienceMin(selectedJobRole.defaultExperienceMin ?? 2);
    setExperienceMax(selectedJobRole.defaultExperienceMax ?? 5);

    const roleSkills = selectedJobRole.roleSkills || [];
    setMustHaveSkillIds(roleSkills.filter((roleSkill) => roleSkill.isMandatory).map((roleSkill) => roleSkill.skillId));
    setNiceToHaveSkillIds(roleSkills.filter((roleSkill) => !roleSkill.isMandatory).map((roleSkill) => roleSkill.skillId));
  }, [selectedJobRole]);

  const getSkillName = React.useCallback((skillId: string) => {
    return catalog?.skills.find((skill) => skill.id === skillId)?.name || skillId;
  }, [catalog]);

  const moveSkill = (skillId: string, target: "must" | "nice") => {
    if (target === "must") {
      setMustHaveSkillIds((current) => current.includes(skillId) ? current : [...current, skillId]);
      setNiceToHaveSkillIds((current) => current.filter((id) => id !== skillId));
      return;
    }

    setNiceToHaveSkillIds((current) => current.includes(skillId) ? current : [...current, skillId]);
    setMustHaveSkillIds((current) => current.filter((id) => id !== skillId));
  };

  const removeSkill = (skillId: string, source: "must" | "nice") => {
    if (source === "must") {
      setMustHaveSkillIds((current) => current.filter((id) => id !== skillId));
      return;
    }

    setNiceToHaveSkillIds((current) => current.filter((id) => id !== skillId));
  };

  const availableMustSkills = React.useMemo(
    () => (catalog?.skills || []).filter((skill) => !mustHaveSkillIds.includes(skill.id)),
    [catalog, mustHaveSkillIds]
  );

  const availableNiceSkills = React.useMemo(
    () => (catalog?.skills || []).filter((skill) => !niceToHaveSkillIds.includes(skill.id)),
    [catalog, niceToHaveSkillIds]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!catalog || !selectedJobRole || !selectedDepartment || !selectedLocation) {
      return;
    }

    const payload: CreateJobPayload = {
      title: selectedJobRole.title,
      jobRoleId: selectedJobRole.id,
      department: selectedDepartment.name,
      departmentId: selectedDepartment.id,
      location: selectedLocation.name,
      locationId: selectedLocation.id,
      panelId: panelId || undefined,
      headcount,
      employmentType,
      workModel,
      seniorityLevel,
      experienceMin,
      experienceMax,
      salaryMin: salaryMin === "" ? undefined : salaryMin,
      salaryMax: salaryMax === "" ? undefined : salaryMax,
      currency,
      payFrequency,
      salaryVisibility,
      requirements: {
        mustHaveSkillIds,
        niceToHaveSkillIds,
        mustHaveSkills: mustHaveSkillIds.map(getSkillName),
        niceToHaveSkills: niceToHaveSkillIds.map(getSkillName),
        minYearsExperience: experienceMin,
        maxYearsExperience: experienceMax,
        educationLevel,
        notes: notes || undefined,
      },
    };

    submit(payload);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-[17px] font-semibold text-slate-800">Create New Job</h2>
              <p className="mt-1 text-[12px] text-slate-400">Structured requisition setup with seeded titles, skills, and locations.</p>
            </div>
            <button onClick={onClose} className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-slate-50 px-6 py-6">
            {isCatalogLoading ? (
              <div className="flex items-center justify-center py-20 text-slate-400">Loading job form catalog...</div>
            ) : catalogError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{catalogError}</div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-indigo-500">
                      <Sparkles size={14} />
                      Role Setup
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Job Title" required>
                        <select className={inputCls} value={jobRoleId} onChange={(e) => setJobRoleId(e.target.value)} required>
                          <option value="">Select job title</option>
                          {catalog?.jobRoles.map((role) => (
                            <option key={role.id} value={role.id}>{role.title}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Department" required>
                        <select className={inputCls} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
                          <option value="">Select department</option>
                          {catalog?.departments.map((department) => (
                            <option key={department.id} value={department.id}>{department.name}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Location" required>
                        <select className={inputCls} value={locationId} onChange={(e) => setLocationId(e.target.value)} required>
                          <option value="">Select location</option>
                          {catalog?.locations.map((location) => (
                            <option key={location.id} value={location.id}>{location.name}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Interview Panel">
                        <select className={inputCls} value={panelId} onChange={(e) => setPanelId(e.target.value)}>
                          <option value="">No panel selected</option>
                          {catalog?.panels.map((panel) => (
                            <option key={panel.id} value={panel.id}>{panel.name}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Headcount" required>
                        <input className={inputCls} type="number" min={1} value={headcount} onChange={(e) => setHeadcount(Number(e.target.value) || 1)} required />
                      </Field>
                      <Field label="Employment Type">
                        <select className={inputCls} value={employmentType} onChange={(e) => setEmploymentType(e.target.value as typeof employmentType)}>
                          <option value="FULL_TIME">Full Time</option>
                          <option value="PART_TIME">Part Time</option>
                          <option value="CONTRACT">Contract</option>
                          <option value="INTERN">Intern</option>
                        </select>
                      </Field>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">Role Defaults</div>
                    {selectedJobRole ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-[14px] font-semibold text-slate-800">{selectedJobRole.title}</p>
                          <p className="mt-1 text-[12px] text-slate-400">{selectedJobRole.description || "Structured title from your seeded job-role library."}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <InfoPill label="Family" value={selectedJobRole.jobFamily || "-"} />
                          <InfoPill label="Level" value={selectedJobRole.level || "-"} />
                          <InfoPill label="Exp" value={`${selectedJobRole.defaultExperienceMin ?? 0}-${selectedJobRole.defaultExperienceMax ?? 0} yrs`} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[13px] text-slate-400">Select a job title to preload its baseline skill set and experience band.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">Experience And Compensation</div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Work Model">
                      <select className={inputCls} value={workModel} onChange={(e) => setWorkModel(e.target.value as typeof workModel)}>
                        <option value="ON_SITE">On-site</option>
                        <option value="REMOTE">Remote</option>
                        <option value="HYBRID">Hybrid</option>
                      </select>
                    </Field>
                    <Field label="Seniority Level">
                      <select className={inputCls} value={seniorityLevel} onChange={(e) => setSeniorityLevel(e.target.value)}>
                        {['Junior', 'Mid', 'Senior', 'Lead', 'Staff', 'Principal'].map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Education Level">
                      <select className={inputCls} value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
                        {['Any', 'High School', "Bachelor's", "Master's", 'PhD'].map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Experience Min">
                      <input className={inputCls} type="number" min={0} value={experienceMin} onChange={(e) => setExperienceMin(Number(e.target.value) || 0)} />
                    </Field>
                    <Field label="Experience Max">
                      <input className={inputCls} type="number" min={0} value={experienceMax} onChange={(e) => setExperienceMax(Number(e.target.value) || 0)} />
                    </Field>
                    <Field label="Currency">
                      <select className={inputCls} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        <option value="USD">USD</option>
                        <option value="CAD">CAD</option>
                        <option value="INR">INR</option>
                      </select>
                    </Field>
                    <Field label="Salary Min">
                      <input className={inputCls} type="number" min={0} value={salaryMin} onChange={(e) => setSalaryMin(e.target.value === '' ? '' : Number(e.target.value))} />
                    </Field>
                    <Field label="Salary Max">
                      <input className={inputCls} type="number" min={0} value={salaryMax} onChange={(e) => setSalaryMax(e.target.value === '' ? '' : Number(e.target.value))} />
                    </Field>
                    <Field label="Pay Frequency">
                      <select className={inputCls} value={payFrequency} onChange={(e) => setPayFrequency(e.target.value as typeof payFrequency)}>
                        <option value="HOURLY">Hourly</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="YEARLY">Yearly</option>
                      </select>
                    </Field>
                    <Field label="Salary Visibility">
                      <select className={inputCls} value={salaryVisibility} onChange={(e) => setSalaryVisibility(e.target.value as typeof salaryVisibility)}>
                        <option value="PUBLIC">Public</option>
                        <option value="INTERNAL">Internal</option>
                        <option value="HIDDEN">Hidden</option>
                      </select>
                    </Field>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <SkillBucket
                    title="Must-Have Skills"
                    selectedSkillIds={mustHaveSkillIds}
                    availableSkills={availableMustSkills}
                    getSkillName={getSkillName}
                    onAdd={(skillId) => moveSkill(skillId, "must")}
                    onRemove={(skillId) => removeSkill(skillId, "must")}
                  />
                  <SkillBucket
                    title="Nice-To-Have Skills"
                    selectedSkillIds={niceToHaveSkillIds}
                    availableSkills={availableNiceSkills}
                    getSkillName={getSkillName}
                    onAdd={(skillId) => moveSkill(skillId, "nice")}
                    onRemove={(skillId) => removeSkill(skillId, "nice")}
                  />
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <Field label="Additional Notes">
                    <textarea
                      className={inputCls + " min-h-[100px] resize-none"}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any extra context for HR or the downstream AI screening pipeline..."
                    />
                  </Field>
                </div>

                {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</p>}
              </div>
            )}
          </form>

          <div className="flex justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700" isLoading={isLoading} onClick={handleSubmit as never} disabled={isCatalogLoading || !catalog || !jobRoleId}>
              Create Job
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-medium text-slate-600">
      {label}{required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const InfoPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
    {label}: {value}
  </span>
);

const SkillBucket: React.FC<{
  title: string;
  selectedSkillIds: string[];
  availableSkills: { id: string; name: string }[];
  getSkillName: (skillId: string) => string;
  onAdd: (skillId: string) => void;
  onRemove: (skillId: string) => void;
}> = ({ title, selectedSkillIds, availableSkills, getSkillName, onAdd, onRemove }) => {
  const [pendingSkillId, setPendingSkillId] = React.useState("");

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</div>
      <div className="min-h-[88px] rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap gap-2">
          {selectedSkillIds.length === 0 && <p className="text-[13px] text-slate-400">No skills selected yet.</p>}
          {selectedSkillIds.map((skillId) => (
            <button
              key={skillId}
              type="button"
              onClick={() => onRemove(skillId)}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[12px] font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
            >
              {getSkillName(skillId)}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <select className={inputCls} value={pendingSkillId} onChange={(e) => setPendingSkillId(e.target.value)}>
          <option value="">Select skill to add</option>
          {availableSkills.map((skill) => (
            <option key={skill.id} value={skill.id}>{skill.name}</option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (!pendingSkillId) return;
            onAdd(pendingSkillId);
            setPendingSkillId("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
};
