
'use client'
import React, { useState } from "react";
import { useParams } from "next/navigation";

// ── Types ─────────────────────────────

type Status = "pending" | "submitted" | "approved" | "rejected" | "";

interface DailyHours {
  day1: string;
  day2: string;
  day3: string;
  day4: string;
  day5: string;
  day6: string;
  day7: string;
}

interface FormState {
  empId: string;
  weekEnding: string;
  claimMonth: string;
  hours: DailyHours;
  status: Status;
  remarks: string;
}

// ── Helpers ───────────────────────────

const DAYS = [
  { label: "Mon", key: "day1" },
  { label: "Tue", key: "day2" },
  { label: "Wed", key: "day3" },
  { label: "Thu", key: "day4" },
  { label: "Fri", key: "day5" },
  { label: "Sat", key: "day6" },
  { label: "Sun", key: "day7" },
];

const emptyHours = (): DailyHours => ({
  day1: "", day2: "", day3: "", day4: "", day5: "", day6: "", day7: ""
});

const today = () => new Date().toISOString().split("T")[0];
const month = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

function calcStats(hours: DailyHours) {
  const values = Object.values(hours).map(v => parseFloat(v) || 0);
  const total = values.reduce((a, b) => a + b, 0);
  const avg = total / 7;
  return { total, avg };
}

// ── Main Component ─────────────────────

export default function Timesheet() {

  const params = useParams();
  const empId = params?.empid as string || "EMP-001";

  const [form, setForm] = useState<FormState>({
    empId,
    weekEnding: today(),
    claimMonth: month(),
    hours: emptyHours(),
    status: "",
    remarks: "",
  });

  const { total, avg } = calcStats(form.hours);

  const setField = (key: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const setHour = (key: keyof DailyHours, value: string) => {
    setForm(prev => ({
      ...prev,
      hours: { ...prev.hours, [key]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(form);
    alert("Submitted!");
  };

  const handleClear = () => {
    setForm({
      empId,
      weekEnding: today(),
      claimMonth: month(),
      hours: emptyHours(),
      status: "",
      remarks: "",
    });
  };

  // ── Styles ─────────────────────────

  const card = {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    marginBottom: 20
  };

  const input = {
    padding: "10px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    width: "100%",
    fontSize: 14,
    outline: "none"
  };

  const label = {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4
  };

  const buttonPrimary = {
    padding: "10px 20px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
  };

  const buttonSecondary = {
    padding: "10px 20px",
    border: "1px solid #ddd",
    borderRadius: 8,
    cursor: "pointer",
    background: "#fff"
  };

  // ── UI ─────────────────────────────

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: 30 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>Timesheet</h1>
        <p style={{ color: "#6b7280", marginBottom: 20 }}>
          Track your weekly work hours
        </p>

        {/* Employee ID Display */}
        <div style={{
          marginBottom: 20,
          padding: "10px 14px",
          background: "#eef2ff",
          borderRadius: 8,
          fontSize: 14,
          color: "#3730a3",
          fontWeight: 500
        }}>
          Employee ID: {empId}
        </div>

        <form onSubmit={handleSubmit}>

          {/* Employee Info */}
          <div style={card}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

              <div>
                <p style={label}>Week Ending</p>
                <input type="date" style={input}
                  value={form.weekEnding}
                  onChange={(e) => setField("weekEnding", e.target.value)}
                />
              </div>

              <div>
                <p style={label}>Month</p>
                <input type="month" style={input}
                  value={form.claimMonth}
                  onChange={(e) => setField("claimMonth", e.target.value)}
                />
              </div>

            </div>
          </div>

          {/* Daily Hours */}
          <div style={card}>
            <p style={{ marginBottom: 10, fontWeight: 600 }}>Daily Hours</p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              gap: 8
            }}>
              {DAYS.map(d => (
                <div key={d.key}>
                  <p style={{ ...label, textAlign: "center" }}>{d.label}</p>
                  <input
                    type="number"
                    placeholder="0"
                    style={{ ...input, textAlign: "center" }}
                    value={form.hours[d.key as keyof DailyHours]}
                    onChange={(e) => setHour(d.key as keyof DailyHours, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 15
            }}>
              <div>
                <p style={label}>Total</p>
                <h3>{total}</h3>
              </div>
              <div>
                <p style={label}>Average</p>
                <h3>{avg.toFixed(1)}</h3>
              </div>
            </div>
          </div>

          {/* Status */}
          <div style={card}>
            <p style={{ marginBottom: 10, fontWeight: 600 }}>Status</p>

            <select
              style={input}
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
            >
              <option value="">Select status</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <div style={{ marginTop: 10 }}>
              <p style={label}>Remarks</p>
              <input
                style={input}
                value={form.remarks}
                onChange={(e) => setField("remarks", e.target.value)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" style={buttonSecondary} onClick={handleClear}>
              Clear
            </button>
            <button type="submit" style={buttonPrimary}>
              Submit
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

