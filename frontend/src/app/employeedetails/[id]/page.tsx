'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronRight, ChevronLeft, Check, AlertCircle, GraduationCap, User, Phone, Briefcase, Mail } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import ROOT_API_URL from '@/services/config';
import { getEmployeeDetails } from '@/services/apiClient';

/* ================= TYPES ================= */

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

const STEPS = [
  { title: 'Contact', icon: Mail },
  { title: 'Personal', icon: User },
  { title: 'Work', icon: Briefcase },
  { title: 'Emergency', icon: Phone },
  { title: 'Education', icon: GraduationCap }
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  
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
      passport: ''
    },
    work: {
      reportingManager: '',
      dateOfJoining: '',
      annualCompensation: ''
    },
    emergency: { name: '', relation: '', phone: '' },
    education: [{ type: '', institute: '', year: '', percentage: '' }]
  });

  /* ================= FETCH & PREFILL (Logic preserved) ================= */

  useEffect(() => {
    const load = async () => {
      const res = await getEmployeeDetails();
      setEmployee(res);
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
        education: employee.educationInfo?.length ? employee.educationInfo : prev.education
      }));
    }
  }, [employee]);

  const handleChange = (section: any, field: string, value: string) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleEducationChange = (i: number, field: keyof Education, value: string) => {
    const updated = [...form.education];
    updated[i][field] = value;
    setForm({ ...form, education: updated });
  };

  const addEducation = () => {
    setForm({
      ...form,
      education: [...form.education, { type: '', institute: '', year: '', percentage: '' }]
    });
  };

  const submit = async () => {
    try {
      setIsLoading(true);
      const clean = (obj: any) => {
        Object.keys(obj).forEach((k) => {
          if (obj[k] === '' || obj[k] === 'Invalid date') obj[k] = null;
          if (typeof obj[k] === 'object' && obj[k]) clean(obj[k]);
        });
        return obj;
      };
      const payload = clean({ ...form });
      await axios.put(`${ROOT_API_URL}/api/employee/update/${userId}`, payload, { withCredentials: true });
      router.push('/employee/profile');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (step / STEPS.length) * 100;

  /* ================= SHARED UI COMPONENTS ================= */

  const InputField = ({ label, ...props }: any) => (
    <div>
      <label className="block text-[13px] font-medium text-slate-600 mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 flex-1 rounded-md text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-100 transition-all shadow-sm"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFC] py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-[28px] font-semibold text-slate-900 tracking-tight">Complete Profile</h1>
          <p className="mt-1.5 text-[15px] text-slate-500">Provide your details to personalize your workspace.</p>
        </div>

        {/* PROGRESS BAR */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
               Step {step} of {STEPS.length}: {STEPS[step-1].title}
            </span>
            <span className="text-xs font-medium text-slate-400">
               {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-slate-200/60 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-in-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* MAIN FORM CARD */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 sm:p-10 min-h-[400px]">
            
            {/* STEP 1: CONTACT */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-medium text-slate-900 mb-6 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-slate-400" />
                  Contact Information
                </h2>
                <InputField label="Personal Email" type="email" placeholder="name@example.com" value={form.contact.personalEmail} onChange={(e:any) => handleChange('contact', 'personalEmail', e.target.value)} />
                <InputField label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" value={form.contact.phone} onChange={(e:any) => handleChange('contact', 'phone', e.target.value)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputField label="City" placeholder="San Francisco" value={form.contact.city} onChange={(e:any) => handleChange('contact', 'city', e.target.value)} />
                  <InputField label="Address Line" placeholder="Apartment, suite, etc." value={form.contact.address} onChange={(e:any) => handleChange('contact', 'address', e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 2: PERSONAL */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-medium text-slate-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-400" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputField label="Date of Birth" type="date" value={form.personal.dob} onChange={(e:any) => handleChange('personal', 'dob', e.target.value)} />
                  <InputField label="Nationality" placeholder="e.g., Indian" value={form.personal.nationality} onChange={(e:any) => handleChange('personal', 'nationality', e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputField label="Blood Group" placeholder="O+" value={form.personal.bloodGroup} onChange={(e:any) => handleChange('personal', 'bloodGroup', e.target.value)} />
                  <InputField label="Marital Status" placeholder="Single" value={form.personal.maritalStatus} onChange={(e:any) => handleChange('personal', 'maritalStatus', e.target.value)} />
                </div>
                <InputField label="Aadhar Number" placeholder="0000 0000 0000" value={form.personal.aadhar} onChange={(e:any) => handleChange('personal', 'aadhar', e.target.value)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputField label="PAN Number" placeholder="ABCDE1234F" value={form.personal.pan} onChange={(e:any) => handleChange('personal', 'pan', e.target.value)} />
                  <InputField label="Passport Number" placeholder="Z1234567" value={form.personal.passport} onChange={(e:any) => handleChange('personal', 'passport', e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 3: WORK */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-medium text-slate-900 mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                  Work Details
                </h2>
                <InputField label="Reporting Manager" placeholder="John Doe" value={form.work.reportingManager} onChange={(e:any) => handleChange('work', 'reportingManager', e.target.value)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputField label="Date of Joining" type="date" value={form.work.dateOfJoining} onChange={(e:any) => handleChange('work', 'dateOfJoining', e.target.value)} />
                  <InputField label="Annual Compensation" type="number" placeholder="50000" value={form.work.annualCompensation} onChange={(e:any) => handleChange('work', 'annualCompensation', e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 4: EMERGENCY */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-medium text-slate-900 mb-6 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-slate-400" />
                  Emergency Contact
                </h2>
                <div className="flex gap-3 p-4 bg-slate-50 border border-slate-200 rounded-md">
                  <AlertCircle className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-600 leading-relaxed">
                    Please provide reliable contact details for emergency situations.
                  </p>
                </div>
                <InputField label="Contact Name" placeholder="Jane Doe" value={form.emergency.name} onChange={(e:any) => handleChange('emergency', 'name', e.target.value)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputField label="Relationship" placeholder="Spouse" value={form.emergency.relation} onChange={(e:any) => handleChange('emergency', 'relation', e.target.value)} />
                  <InputField label="Phone Number" placeholder="+1 (555) 000-0000" value={form.emergency.phone} onChange={(e:any) => handleChange('emergency', 'phone', e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 5: EDUCATION */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-medium text-slate-900 mb-6 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-slate-400" />
                  Education
                </h2>
                {form.education.map((edu, i) => (
                  <div key={i} className="relative p-5 bg-white border border-slate-200 rounded-md space-y-5 shadow-sm">
                    <span className="inline-block px-2.5 py-1 bg-slate-100 text-[11px] font-bold text-slate-600 rounded uppercase tracking-wider mb-2">Record {i+1}</span>
                    <InputField label="Degree / Course" placeholder="B.Tech Computer Science" value={edu.type} onChange={(e:any) => handleEducationChange(i, 'type', e.target.value)} />
                    <InputField label="Institute" placeholder="Stanford University" value={edu.institute} onChange={(e:any) => handleEducationChange(i, 'institute', e.target.value)} />
                    <div className="grid grid-cols-2 gap-5">
                      <InputField label="Graduation Year" type="number" placeholder="2022" value={edu.year} onChange={(e:any) => handleEducationChange(i, 'year', e.target.value)} />
                      <InputField label="Score / GPA" placeholder="3.8" value={edu.percentage} onChange={(e:any) => handleEducationChange(i, 'percentage', e.target.value)} />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEducation}
                  className="w-full py-2.5 border border-dashed border-slate-300 text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors rounded-md font-medium text-sm flex items-center justify-center gap-2"
                >
                  <span className="text-lg leading-none">+</span> Add Education Record
                </button>
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {step < STEPS.length ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md font-medium text-[14px] hover:bg-blue-700 transition-colors active:scale-[0.98]"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={isLoading}
               className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-md font-medium text-[14px] hover:bg-slate-800 transition-colors active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Submit Profile
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}