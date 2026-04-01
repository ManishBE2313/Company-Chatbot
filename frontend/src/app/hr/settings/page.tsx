"use client";

import React, { useState, useEffect } from "react";
import RoleManagementSection from "@/components/hr/RoleManagementSection";
import {Button} from "@/components/ui/Button";
import { AsanaSpinner } from "@/components/ui/AsanaSpinner";
import { ShieldCheck, AlertCircle, CheckCircle } from "lucide-react";
import { useHRCurrentUser } from "@/hooks/useHRData"; 
import { UserRole } from "@/types/hr"; 

export default function CompanySettingsPage() {
  const [activeTab, setActiveTab] = useState<"roles" | "review-jobs">("roles");
  const { user, isLoading: isUserLoading } = useHRCurrentUser(); 

  // Show a spinner while the user data is loading
  if (isUserLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <AsanaSpinner size="lg" className="text-indigo-500" />
      </div>
    );
  }

  // Fallback if user somehow fails to load
  if (!user) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 text-slate-500">
        Unable to load user profile.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Company Settings</h1>
          <p className="text-sm text-gray-500">Manage organizational roles and review AI-flagged job requests.</p>
        </div>
      </header>

      {/* Asana-style Tabs */}
      <div className="border-b border-gray-200 px-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("roles")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
              activeTab === "roles"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Assign Roles
          </button>
          <button
            onClick={() => setActiveTab("review-jobs")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "review-jobs"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Review Draft Jobs
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="mx-auto max-w-5xl">
          {activeTab === "roles" ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* FIXED: Passing the required props down to the component */}
              <RoleManagementSection 
                currentUserEmail={user.email} 
                currentUserRole={user.role as UserRole} 
              />
            </div>
          ) : (
            <ReviewDraftJobsSection />
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Inline Component: Review Draft Jobs
// ==========================================
function ReviewDraftJobsSection() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchDraftJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/hr/jobs?reviewStatus=needs_review");
      const data = await res.json();
      if (res.ok) setJobs(data.data || []);
    } catch (err) {
      console.error("Failed to fetch draft jobs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDraftJobs();
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
        setJobs(jobs.filter(j => j.id !== jobId));
      } else {
        alert("Failed to approve job.");
      }
    } catch (err) {
      console.error("Error approving job:", err);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <AsanaSpinner size="lg" className="text-indigo-500" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center">
        <ShieldCheck className="h-12 w-12 text-green-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
        <p className="text-gray-500 mt-2">There are no drafted jobs waiting for HR review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div key={job.id} className="bg-white rounded-lg shadow-sm border border-yellow-200 overflow-hidden">
          <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-medium">
                  Needs Review
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Requested by: <span className="font-medium">{job.createdBy?.email || "Unknown Manager"}</span> | 
                Department: {job.department}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700">AI Confidence</p>
              <p className={`text-xl font-bold ${job.aiMatchPercentage < 50 ? 'text-red-600' : 'text-yellow-600'}`}>
                {job.aiMatchPercentage}%
              </p>
            </div>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Job Description / Requirements</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-slate-50 p-3 rounded border border-gray-100 max-h-48 overflow-y-auto">
                {job.criteria?.requirements?.rawText || "No description provided."}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => alert("Edit functionality can be added here!")}>
              Edit Details
            </Button>
            <Button 
              onClick={() => handleApprove(job.id)}
              disabled={processingId === job.id}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            >
              {processingId === job.id ? <AsanaSpinner size="sm" /> : <CheckCircle className="h-4 w-4" />}
              Approve & Publish
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}