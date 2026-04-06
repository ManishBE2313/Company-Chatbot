'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { getEmployeeDetails, submitTimesheet, TimesheetPayload } from '@/services/apiClient';

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
  employeeEmail: string;
  weekEnding: string;
  claimMonth: string;
  hours: DailyHours;
  remarks: string;
}

const DAYS = [
  { label: 'Mon', key: 'day1' },
  { label: 'Tue', key: 'day2' },
  { label: 'Wed', key: 'day3' },
  { label: 'Thu', key: 'day4' },
  { label: 'Fri', key: 'day5' },
  { label: 'Sat', key: 'day6' },
  { label: 'Sun', key: 'day7' },
];

const emptyHours = (): DailyHours => ({
  day1: '',
  day2: '',
  day3: '',
  day4: '',
  day5: '',
  day6: '',
  day7: '',
});

const today = () => new Date().toISOString().split('T')[0];
const month = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

function getFridayOptions(claimMonth: string) {
  const [year, monthValue] = claimMonth.split('-').map(Number);
  if (!year || !monthValue) return [];

  const current = new Date(year, monthValue - 1, 1);
  const fridays: string[] = [];

  while (current.getMonth() === monthValue - 1) {
    if (current.getDay() === 5) {
      fridays.push(current.toISOString().split('T')[0]);
    }
    current.setDate(current.getDate() + 1);
  }

  return fridays;
}

function calcStats(hours: DailyHours) {
  const values = Object.values(hours).map((v) => parseFloat(v) || 0);
  const total = values.reduce((a, b) => a + b, 0);
  const avg = total / 7;
  return { total, avg };
}

export default function TimesheetPage() {
  const params = useParams();
  const rawEmployeeId = (params?.id as string) || '';
  const employeeId = decodeURIComponent(rawEmployeeId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialMonth = month();
  const initialFridayOptions = getFridayOptions(initialMonth);

  const [form, setForm] = useState<FormState>({
    employeeEmail: '',
    weekEnding: initialFridayOptions[0] || today(),
    claimMonth: initialMonth,
    hours: emptyHours(),
    remarks: '',
  });

  const { total, avg } = calcStats(form.hours);
  const fridayOptions = getFridayOptions(form.claimMonth);

  React.useEffect(() => {
    const loadEmployee = async () => {
      try {
        const employee = await getEmployeeDetails();
        setForm((prev) => ({
          ...prev,
          employeeEmail: employee?.workEmail || employee?.email || '',
        }));
      } catch (error) {
        console.error('Failed to load employee details for timesheet', error);
      }
    };

    void loadEmployee();
  }, []);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setHour = (key: keyof DailyHours, value: string) => {
    setForm((prev) => ({
      ...prev,
      hours: { ...prev.hours, [key]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: TimesheetPayload = {
      employeeEmail: form.employeeEmail,
      weekEnding: form.weekEnding,
      claimMonth: form.claimMonth,
      hours: form.hours,
      status: 'submitted',
      remarks: form.remarks,
    };

    try {
      setIsSubmitting(true);
      await submitTimesheet(employeeId, payload);
      alert('Timesheet submitted successfully.');
    } catch (error) {
      console.error('Timesheet submit failed', error);
      alert(error instanceof Error ? error.message : 'Failed to submit timesheet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    const resetMonth = month();
    const resetFridayOptions = getFridayOptions(resetMonth);

    setForm({
      employeeEmail: '',
      weekEnding: resetFridayOptions[0] || today(),
      claimMonth: resetMonth,
      hours: emptyHours(),
      remarks: '',
    });
  };

  const card = {
    background: '#fff',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    marginBottom: 20,
  } as const;

  const input = {
    padding: '10px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    width: '100%',
    fontSize: 14,
    outline: 'none',
  } as const;

  const label = {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  } as const;

  const buttonPrimary = {
    padding: '10px 20px',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  } as const;

  const buttonSecondary = {
    padding: '10px 20px',
    border: '1px solid #ddd',
    borderRadius: 8,
    cursor: 'pointer',
    background: '#fff',
  } as const;

  return (
    <div style={{ minHeight: '100vh', padding: 30 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>Timesheet</h1>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>Track your weekly work hours</p>

        <div
          style={{
            marginBottom: 20,
            padding: '10px 14px',
            background: '#eef2ff',
            borderRadius: 8,
            fontSize: 14,
            color: '#3730a3',
            fontWeight: 500,
          }}
        >
          Employee Id: {employeeId}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <p style={label}>Month</p>
                <input
                  type="month"
                  style={input}
                  value={form.claimMonth}
                  onChange={(e) => {
                    const nextMonth = e.target.value;
                    const nextFridayOptions = getFridayOptions(nextMonth);

                    setForm((prev) => ({
                      ...prev,
                      claimMonth: nextMonth,
                      weekEnding:
                        nextFridayOptions.includes(prev.weekEnding) ? prev.weekEnding : nextFridayOptions[0] || '',
                    }));
                  }}
                />
              </div>
            </div>
          </div>

          <div style={card}>
            <p style={label}>Week Ending</p>
            <select
              style={input}
              value={form.weekEnding}
              onChange={(e) => setField('weekEnding', e.target.value)}
            >
              {fridayOptions.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>

          <div style={card}>
            <p style={{ marginBottom: 10, fontWeight: 600 }}>Daily Hours</p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7,1fr)',
                gap: 8,
              }}
            >
              {DAYS.map((d) => (
                <div key={d.key}>
                  <p style={{ ...label, textAlign: 'center' }}>{d.label}</p>
                  <input
                    type="number"
                    placeholder="0"
                    style={{ ...input, textAlign: 'center' }}
                    value={form.hours[d.key as keyof DailyHours]}
                    onChange={(e) => setHour(d.key as keyof DailyHours, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 15,
              }}
            >
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

          <div style={card}>
            <p style={label}>Remarks</p>
            <input style={input} value={form.remarks} onChange={(e) => setField('remarks', e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" style={buttonSecondary} onClick={handleClear}>
              Clear
            </button>
            <button type="submit" style={buttonPrimary} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
