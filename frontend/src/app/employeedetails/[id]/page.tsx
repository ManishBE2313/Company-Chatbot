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
    description: 'Email, phone, and location',
    icon: Mail,
  },
  {
    title: 'Personal',
    description: 'Identity and profile details',
    icon: User,
  },
  {
    title: 'Work',
    description: 'Reporting and joining info',
    icon: Briefcase,
  },
  {
    title: 'Emergency',
    description: 'Urgent contact details',
    icon: Phone,
  },
  {
    title: 'Education',
    description: 'Academic background',
    icon: GraduationCap,
  },
];

function InputField({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
      </div>
      <input
        {...props}
        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-300 hover:bg-slate-50 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10"
      />
    </div>
  );
}

function SectionIntro({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Mail;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 border-b border-slate-100 pb-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
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
  const initials = `${employee?.firstName?.[0] ?? 'E'}${employee?.lastName?.[0] ?? 'P'}`.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Navigation / Header */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Employee Onboarding
            </h1>
          </div>
          <div className="hidden items-center gap-4 text-sm sm:flex">
            <span className="text-slate-500">Profile Completion</span>
            <div className="flex items-center gap-3">
              <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="font-semibold text-slate-700">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Employee Summary Card */}
            <Panel className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-700">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-slate-900">{profileName}</p>
                  <p className="truncate text-sm text-slate-500">
                    {employee?.workInfo?.designation || 'Pending Title'}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate text-slate-600">
                    {form.contact.personalEmail || employee?.email || 'Email pending'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="text-slate-600">{form.contact.phone || 'Phone pending'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="text-slate-600">
                    {form.contact.city || employee?.workInfo?.location || 'Location pending'}
                  </span>
                </div>
              </div>
            </Panel>

            {/* Step Navigation */}
            <nav aria-label="Progress">
              <ol role="list" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {STEPS.map((item, index) => {
                  const Icon = item.icon;
                  const itemStep = index + 1;
                  const isActive = itemStep === step;
                  const isComplete = itemStep < step;

                  return (
                    <li key={item.title} className="relative">
                      {index !== STEPS.length - 1 ? (
                        <div className="absolute left-6 top-10 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" />
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setStep(itemStep)}
                        className={`group relative flex w-full items-start px-5 py-4 transition-colors hover:bg-slate-50 ${
                          isActive ? 'bg-slate-50/50' : ''
                        }`}
                      >
                        <div className="flex h-9 items-center">
                          <span
                            className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full ${
                              isComplete
                                ? 'bg-teal-500 text-white'
                                : isActive
                                ? 'border-2 border-teal-500 bg-white text-teal-600'
                                : 'border-2 border-slate-200 bg-white text-slate-400 group-hover:border-slate-300'
                            }`}
                          >
                            {isComplete ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <span className="text-xs font-semibold">{itemStep}</span>
                            )}
                          </span>
                        </div>
                        <div className="ml-4 min-w-0 flex-1 flex-col text-left">
                          <span
                            className={`text-sm font-semibold ${
                              isActive ? 'text-teal-700' : isComplete ? 'text-slate-900' : 'text-slate-500'
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="text-xs text-slate-500">{item.description}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>

          {/* Main Form Content */}
          <div className="flex flex-col gap-6">
            <Panel className="overflow-hidden">
              <div className="p-6 sm:p-8">
                {step === 1 && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <SectionIntro
                      icon={Mail}
                      title="Contact Information"
                      description="How can we reach you? These details keep your employee records accurate."
                    />
                    <div className="grid gap-6 sm:grid-cols-2">
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
                          label="Street Address"
                          placeholder="Apartment, suite, building, street"
                          value={form.contact.address}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('contact', 'address', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <SectionIntro
                      icon={User}
                      title="Personal Details"
                      description="Required for compliance, identification, and internal administration."
                    />
                    <div className="grid gap-6 sm:grid-cols-2">
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
                        label="PAN Number"
                        placeholder="ABCDE1234F"
                        value={form.personal.pan}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('personal', 'pan', e.target.value)}
                      />
                      <InputField
                        label="UAN Number"
                        placeholder="100000000000"
                        value={form.personal.uan}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('personal', 'uan', e.target.value)}
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
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <SectionIntro
                      icon={Briefcase}
                      title="Work Details"
                      description="Keeps your team structure and employment records aligned."
                    />
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <InputField
                          label="Reporting Manager"
                          placeholder="Manager's Name"
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
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <SectionIntro
                      icon={ShieldCheck}
                      title="Emergency Contact"
                      description="Who should we contact in case of an urgent situation?"
                    />
                    
                    <div className="mb-6 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                      <p className="text-sm text-amber-900">
                        Please provide reliable contact information. This should be someone we can reach without delay in emergencies.
                      </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
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
                        placeholder="Spouse, Parent, etc."
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
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <SectionIntro
                      icon={GraduationCap}
                      title="Education History"
                      description="List your degrees and institutes to complete your academic profile."
                    />

                    <div className="space-y-6">
                      {form.education.map((edu, index) => (
                        <div
                          key={index}
                          className="relative rounded-xl border border-slate-200 bg-slate-50/50 p-6"
                        >
                          <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900">Record {index + 1}</h3>
                            {form.education.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = form.education.filter((_, i) => i !== index);
                                  setForm({ ...form, education: updated });
                                }}
                                className="text-xs font-medium text-red-600 hover:text-red-700"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid gap-5 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                              <InputField
                                label="Degree / Course"
                                placeholder="e.g., B.Tech Computer Science"
                                value={edu.type}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleEducationChange(index, 'type', e.target.value)}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <InputField
                                label="Institute"
                                placeholder="University Name"
                                value={edu.institute}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleEducationChange(index, 'institute', e.target.value)}
                              />
                            </div>
                            <InputField
                              label="Graduation Year"
                              type="number"
                              placeholder="YYYY"
                              value={edu.year}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => handleEducationChange(index, 'year', e.target.value)}
                            />
                            <InputField
                              label="Score / GPA"
                              placeholder="e.g., 3.8 or 85%"
                              value={edu.percentage}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => handleEducationChange(index, 'percentage', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addEducation}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white p-4 text-sm font-medium text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                      >
                        <span className="text-lg leading-none">+</span>
                        Add another degree
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:px-8">
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200/50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>

                {step < STEPS.length ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/10"
                  >
                    Next step
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submit}
                    disabled={isLoading}
                    className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-600/20 disabled:pointer-events-none disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Complete Profile
                      </>
                    )}
                  </button>
                )}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}