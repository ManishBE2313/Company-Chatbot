'use client';

import { useEffect, useState } from 'react';
import { Bell, Users, FileText, TrendingUp } from 'lucide-react';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

const statCards: StatCard[] = [
  {
    title: 'Pending Leaves',
    value: 2,
    icon: <FileText className="w-6 h-6" />,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    title: 'Days Balance',
    value: 12,
    icon: <TrendingUp className="w-6 h-6" />,
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
  },
  {
    title: 'Team Members',
    value: 8,
    icon: <Users className="w-6 h-6" />,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
  {
    title: 'Announcements',
    value: 5,
    icon: <Bell className="w-6 h-6" />,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
  },
];

export default function DashboardPage() {
  const [userName, setUserName] = useState('John');

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Welcome back, {userName}! 👋</h1>
        <p className="text-muted-foreground mt-2">Here&apos;s your employee portal dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-foreground mt-2">{card.value}</p>
              </div>
              <div className={`${card.bgColor} ${card.textColor} p-3 rounded-lg`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-8">
        <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-border rounded-lg hover:bg-muted transition-colors text-left">
            <p className="font-semibold text-foreground">Apply for Leave</p>
            <p className="text-sm text-muted-foreground mt-1">Submit a new leave request</p>
          </button>
          <button className="p-4 border-2 border-dashed border-border rounded-lg hover:bg-muted transition-colors text-left">
            <p className="font-semibold text-foreground">Download Payslip</p>
            <p className="text-sm text-muted-foreground mt-1">Get your latest salary slip</p>
          </button>
          <button className="p-4 border-2 border-dashed border-border rounded-lg hover:bg-muted transition-colors text-left">
            <p className="font-semibold text-foreground">Update Profile</p>
            <p className="text-sm text-muted-foreground mt-1">Edit your information</p>
          </button>
          <button className="p-4 border-2 border-dashed border-border rounded-lg hover:bg-muted transition-colors text-left">
            <p className="font-semibold text-foreground">Contact Support</p>
            <p className="text-sm text-muted-foreground mt-1">Get help from HR team</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-8">
        <h2 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { activity: 'Leave approved for March 15-16', date: '2 hours ago', icon: '✓' },
            { activity: 'Salary slip generated for February', date: '3 days ago', icon: '💰' },
            { activity: 'Profile updated successfully', date: '1 week ago', icon: '✏️' },
            { activity: 'Attendance marked present', date: '1 week ago', icon: '✓' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
              <div className="text-2xl">{item.icon}</div>
              <div className="flex-1">
                <p className="text-foreground font-medium">{item.activity}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
