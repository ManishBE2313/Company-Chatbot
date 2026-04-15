// components/hr/SharepointSyncModal.tsx
"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button"; // Using your existing UI component

interface SharepointSyncModalProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SharepointSyncModal({ jobId, isOpen, onClose }: SharepointSyncModalProps) {
  const [folderUrl, setFolderUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderUrl.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/hr/jobs/${jobId}/sharepoint-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderUrl }),
      });

      const data = await res.json();

      if (res.ok || res.status === 202) {
        setMessage({ text: data.message || "Import started successfully in the background.", type: "success" });
        setFolderUrl("");
        // Close modal automatically after 2 seconds on success
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ text: data.message || "Failed to start import.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "A network error occurred.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Bulk Import Resumes</h2>
        <p className="text-sm text-gray-600 mb-4">
          Paste the Microsoft SharePoint or OneDrive folder URL containing the candidate resumes (PDFs).
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Folder URL
            </label>
            <input
              type="url"
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://company.sharepoint.com/..."
              value={folderUrl}
              onChange={(e) => setFolderUrl(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !folderUrl}>
              {isSubmitting ? "Starting..." : "Start Import"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}