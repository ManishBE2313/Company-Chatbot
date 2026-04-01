'use client';

import { type ChangeEvent, type InputHTMLAttributes, type ReactNode, useEffect, useState } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  Briefcase,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import ROOT_API_URL from '@/services/config';
import { getEmployeeDetails } from '@/services/apiClient';

type Education = {
  type: string;
  institute: string;
  year: string;
  percentage: string;
};

type FormType = {
  contact: {
    personalEmail: string;
    phone: string;
    city: string;
    address: string;
  };
  personal: {
    nationality: string;
    dob: string;
    bloodGroup: string;
    maritalStatus: string;
    aadhar: string;
    pan: string;
    uan: string;
    passport: string;
  };
  work: {
    reportingManager: string;
    dateOfJoining: string;
    annualCompensation: string;
  };
  emergency: {
    name: string;
    relation: string;
    phone: string;
  };
  education: Education[];
};

type EmployeeProfileData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  employeeContact?: Partial<FormType['contact']>;
  employeePersonal?: Partial<FormType['personal']>;
  employeeEmergency?: Partial<FormType['emergency']>;
  employeeEducations?: Education[];
  contactDetails?: Partial<FormType['contact']>;
  aboutMe?: Partial<FormType['personal']>;
  workInfo?: Partial<FormType['work']> & {
    designation?: string;
    department?: string;
    location?: string;
    emergencyContact?: Partial<FormType['emergency']>;
  };
  educationInfo?: Education[];
};

const STEPS = [
  {
    title: 'Contact',
    description: 'Email, phone, and location details',
    icon: Mail,
  },
  {
    title: 'Personal',
    description: 'Identity and personal profile information',
    icon: User,
  },
  {
    title: 'Work',
    description: 'Reporting structure and joining details',
    icon: Briefcase,
  },
  {
    title: 'Emergency',
    description: 'Reliable contact for urgent situations',
    icon: Phone,
  },
  {
    title: 'Education',
    description: 'Academic background and qualifications',
    icon: GraduationCap,
  },
];

function InputField({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <label className="text-[13px] font-semibold text-slate-700">{label}</label>
        {hint ? <span className="text-[11px] text-slate-400">{hint}</span> : null}
      </div>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-all placeholder:text-slate-400 focus:border-[#fc636b] focus:ring-4 focus:ring-rose-100"
      />
    </div>
  );
}

function SectionIntro({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: typeof Mail;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#fff7f5_0%,#ffffff_55%,#fff1f2_100%)] p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f243d] text-white shadow-lg shadow-slate-200">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#fc636b]">{eyebrow}</p>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] ${className}`}>
      {children}
    </div>
  );
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [employee, setEmployee] = useState<EmployeeProfileData | null>(null);

  const [form, setForm] = useState<FormType>({
    contact: { personalEmail: '', phone: '', city: '', address: '' },
    personal: {
      nationality: '',
      dob: '',
      bloodGroup: '',
      maritalStatus: '',
      aadhar: '',
      pan: '',
      uan: '',
      passport: '',
    },
    work: {
      reportingManager: '',
      dateOfJoining: '',
      annualCompensation: '',
    },
    emergency: { name: '', relation: '', phone: '' },
    education: [{ type: '', institute: '', year: '', percentage: '' }],
  });

  useEffect(() => {
    const load = async () => {
      const res = (await getEmployeeDetails()) as EmployeeProfileData;
      setEmployee({
        ...res,
        contactDetails: res.employeeContact || {},
        aboutMe: res.employeePersonal || {},
        workInfo: {
          ...(res.workInfo || {}),
          emergencyContact: res.employeeEmergency || {},
        },
        educationInfo: res.employeeEducations || [],
      });
    };
    load();
  }, []);

  useEffect(() => {
    if (employee) {
      setForm((prev) => ({
        ...prev,
        contact: { ...prev.contact, ...employee.contactDetails },
        personal: { ...prev.personal, ...employee.aboutMe },
        work: { ...prev.work, ...employee.workInfo },
        emergency: { ...prev.emergency, ...employee.workInfo?.emergencyContact },
        education: employee.educationInfo?.length ? employee.educationInfo : prev.education,
      }));
    }
  }, [employee]);

  const handleChange = <TSection extends 'contact' | 'personal' | 'work' | 'emergency'>(
    section: TSection,
    field: keyof FormType[TSection],
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    const updated = [...form.education];
    updated[index][field] = value;
    setForm({ ...form, education: updated });
  };

  const addEducation = () => {
    setForm({
      ...form,
      education: [...form.education, { type: '', institute: '', year: '', percentage: '' }],
    });
  };

  const normalizeValue = (value: string) => {
    return value.trim() === '' || value === 'Invalid date' ? null : value;
  };

  const buildPayload = () => ({
    contact: {
      personalEmail: normalizeValue(form.contact.personalEmail),
      phone: normalizeValue(form.contact.phone),
      city: normalizeValue(form.contact.city),
      address: normalizeValue(form.contact.address),
    },
    personal: {
      nationality: normalizeValue(form.personal.nationality),
      dob: normalizeValue(form.personal.dob),
      bloodGroup: normalizeValue(form.personal.bloodGroup),
      maritalStatus: normalizeValue(form.personal.maritalStatus),
      aadhar: normalizeValue(form.personal.aadhar),
      pan: normalizeValue(form.personal.pan),
      uan: normalizeValue(form.personal.uan),
      passport: normalizeValue(form.personal.passport),
    },
    work: {
      reportingManager: normalizeValue(form.work.reportingManager),
      dateOfJoining: normalizeValue(form.work.dateOfJoining),
      annualCompensation: normalizeValue(form.work.annualCompensation),
    },
    emergency: {
      name: normalizeValue(form.emergency.name),
      relation: normalizeValue(form.emergency.relation),
      phone: normalizeValue(form.emergency.phone),
    },
    education: form.education
      .map((edu) => ({
        type: normalizeValue(edu.type),
        institute: normalizeValue(edu.institute),
        year: normalizeValue(edu.year),
        percentage: normalizeValue(edu.percentage),
      }))
      .filter((edu) => Object.values(edu).some((value) => value !== null)),
  });

  const submit = async () => {
    try {
      setIsLoading(true);
      const payload = buildPayload();
      await axios.put(`${ROOT_API_URL}/api/employee/update/${userId}`, payload, { withCredentials: true });
      router.push('/employee/profile');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (step / STEPS.length) * 100;
  const currentStep = STEPS[step - 1];
  const profileName = [employee?.firstName, employee?.lastName].filter(Boolean).join(' ') || 'Employee profile';
  const initials =
    `${employee?.firstName?.[0] ?? 'E'}${employee?.lastName?.[0] ?? 'P'}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(252,99,107,0.10),_transparent_28%),linear-gradient(180deg,#fcfcfd_0%,#f7f8fb_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-[#c74452]">
                <Sparkles className="h-3.5 w-3.5" />
               Employee Information Portal
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Complete your employee profile
              </h1>
              <p className="mt-3 max-w-xl text-[15px] leading-7 text-slate-500">
                Add the details your team needs for communication, operations, and people records. Everything is organized step by step so you can finish quickly.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Progress</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{Math.round(progress)}%</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current step</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{currentStep.title}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Records</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{form.education.length} education items</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-6">
            <Panel className="overflow-hidden p-0">
              <div className="bg-[linear-gradient(135deg,#1f243d_0%,#2f365c_100%)] px-6 py-7 text-white">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/14 text-lg font-semibold ring-1 ring-white/20">
                    {initials}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{profileName}</p>
                    <p className="mt-1 text-sm text-slate-200">
                      {employee?.workInfo?.designation || 'Employee'}
                      {employee?.workInfo?.department ? ` | ${employee.workInfo.department}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-6 py-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>{form.contact.personalEmail || employee?.email || 'No personal email added yet'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{form.contact.phone || 'Phone number pending'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{form.contact.city || employee?.workInfo?.location || 'Location not added'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    <span>{form.work.dateOfJoining || 'Joining date pending'}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Keep this profile complete so HR, payroll, and your reporting team always have the latest information.
                </div>
              </div>
            </Panel>

            <Panel className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Profile sections</p>
                  <p className="text-xs text-slate-500">Move through each section in order</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {step}/{STEPS.length}
                </span>
              </div>

              <div className="space-y-2">
                {STEPS.map((item, index) => {
                  const Icon = item.icon;
                  const itemStep = index + 1;
                  const isActive = itemStep === step;
                  const isComplete = itemStep < step;

                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => setStep(itemStep)}
                      className={`flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
                        isActive
                          ? 'bg-rose-50 ring-1 ring-rose-200'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${
                          isComplete
                            ? 'bg-emerald-100 text-emerald-700'
                            : isActive
                              ? 'bg-[#fc636b] text-white'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${isActive ? 'text-slate-950' : 'text-slate-700'}`}>
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Panel>
          </div>

          <div className="space-y-4">
          <Panel className="overflow-hidden p-0">
            <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Step {step} of {STEPS.length}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">{currentStep.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{currentStep.description}</p>
                </div>

                <div className="w-full max-w-xs">
                  <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-400">
                    <span>Completion progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-[linear-gradient(90deg,#fc636b_0%,#ff9b7a_100%)] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              {step === 1 && (
                <div className="space-y-6">
                  <SectionIntro
                    icon={Mail}
                    eyebrow="Contact"
                    title="Make it easy to reach you"
                    description="These details help your team communicate smoothly and keep employee records accurate across HR and operations."
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <InputField
                        label="Personal Email"
                        type="email"
                        placeholder="name@example.com"
                        value={form.contact.personalEmail}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('contact', 'personalEmail', e.target.value)}
                      />
                    </div>
                    <InputField
                      label="Phone Number"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={form.contact.phone}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('contact', 'phone', e.target.value)}
                    />
                    <InputField
                      label="City"
                      placeholder="San Francisco"
                      value={form.contact.city}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('contact', 'city', e.target.value)}
                    />
                    <div className="sm:col-span-2">
                      <InputField
                        label="Address Line"
                        placeholder="Apartment, suite, building, street"
                        value={form.contact.address}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('contact', 'address', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <SectionIntro
                    icon={User}
                    eyebrow="Personal"
                    title="Personal identity and compliance details"
                    description="Capture the information commonly required for employee records, identification, and internal administration."
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <InputField
                      label="Date of Birth"
                      type="date"
                      value={form.personal.dob}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('personal', 'dob', e.target.value)}
                    />
                    <InputField
                      label="Nationality"
                      placeholder="e.g., Indian"
                      value={form.personal.nationality}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('personal', 'nationality', e.target.value)}
                    />
                    <InputField
                      label="Blood Group"
                      placeholder="O+"
                      value={form.personal.bloodGroup}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('personal', 'bloodGroup', e.target.value)}
                    />
                    <InputField
                      label="Marital Status"
                      placeholder="Single"
                      value={form.personal.maritalStatus}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('personal', 'maritalStatus', e.target.value)}
                    />
                    <InputField
                      label="Aadhar Number"
                      placeholder="0000 0000 0000"
                      value={form.personal.aadhar}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('personal', 'aadhar', e.target.value)}
                    />
                    <InputField
                      label="UAN Number"
                      placeholder="100000000000"
                      value={form.personal.uan}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('personal', 'uan', e.target.value)}
                    />
                    <InputField
                      label="PAN Number"
                      placeholder="ABCDE1234F"
                      value={form.personal.pan}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('personal', 'pan', e.target.value)}
                    />
                    <InputField
                      label="Passport Number"
                      placeholder="Z1234567"
                      value={form.personal.passport}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('personal', 'passport', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <SectionIntro
                    icon={Briefcase}
                    eyebrow="Work"
                    title="Employment and reporting information"
                    description="This section keeps your team structure, employment dates, and compensation records aligned for internal workflows."
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <InputField
                        label="Reporting Manager"
                        placeholder="John Doe"
                        value={form.work.reportingManager}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('work', 'reportingManager', e.target.value)}
                      />
                    </div>
                    <InputField
                      label="Date of Joining"
                      type="date"
                      value={form.work.dateOfJoining}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('work', 'dateOfJoining', e.target.value)}
                    />
                    <InputField
                      label="Annual Compensation"
                      type="number"
                      placeholder="50000"
                      value={form.work.annualCompensation}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('work', 'annualCompensation', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <SectionIntro
                    icon={ShieldCheck}
                    eyebrow="Emergency"
                    title="Emergency contact details"
                    description="Choose someone dependable who can be reached quickly if support is needed outside normal communication channels."
                  />

                  <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <p className="text-sm leading-6 text-amber-900">
                      Please provide reliable contact information for urgent situations. This should be someone your organization can reach without delay.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <InputField
                        label="Contact Name"
                        placeholder="Jane Doe"
                        value={form.emergency.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('emergency', 'name', e.target.value)}
                      />
                    </div>
                    <InputField
                      label="Relationship"
                      placeholder="Spouse"
                      value={form.emergency.relation}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('emergency', 'relation', e.target.value)}
                    />
                    <InputField
                      label="Phone Number"
                      placeholder="+1 (555) 000-0000"
                      value={form.emergency.phone}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('emergency', 'phone', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <SectionIntro
                    icon={GraduationCap}
                    eyebrow="Education"
                    title="Showcase your academic background"
                    description="List your degrees, institutes, and scores so your employee record reflects your qualification history clearly."
                  />

                  <div className="space-y-4">
                    {form.education.map((edu, index) => (
                      <div
                        key={index}
                        className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfd_100%)] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                      >
                        <div className="mb-5 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Education record {index + 1}</p>
                            <p className="text-xs text-slate-500">Add degree details and academic performance</p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Record {index + 1}
                          </span>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <InputField
                              label="Degree / Course"
                              placeholder="B.Tech Computer Science"
                              value={edu.type}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => handleEducationChange(index, 'type', e.target.value)}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <InputField
                              label="Institute"
                              placeholder="Stanford University"
                              value={edu.institute}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => handleEducationChange(index, 'institute', e.target.value)}
                            />
                          </div>
                          <InputField
                            label="Graduation Year"
                            type="number"
                            placeholder="2022"
                            value={edu.year}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleEducationChange(index, 'year', e.target.value)}
                          />
                          <InputField
                            label="Score / GPA"
                            placeholder="3.8"
                            value={edu.percentage}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleEducationChange(index, 'percentage', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addEducation}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600 transition hover:border-[#fc636b] hover:bg-rose-50 hover:text-[#c74452]"
                  >
                    <span className="text-lg leading-none">+</span>
                    Add education record
                  </button>
                </div>
              )}
            </div>

          </Panel>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>

                <p className="max-w-md text-sm text-slate-500">
                  {step < STEPS.length ? 'Review this section, then continue to the next one.' : 'Everything looks ready for submission.'}
                </p>
              </div>

              <div className="flex-shrink-0">
                {step < STEPS.length ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f243d] px-6 py-3.5 text-sm font-semibold text-black shadow-lg shadow-slate-200 transition hover:bg-[#171b2d] sm:w-auto"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submit}
                    disabled={isLoading}
                    className="inline-flex w-full min-w-[190px] items-center justify-center gap-2 rounded-xl bg-[#fc636b] px-6 py-3.5 text-sm font-semibold text-black shadow-lg shadow-rose-200 transition hover:bg-[#f2555f] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Submit profile
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
