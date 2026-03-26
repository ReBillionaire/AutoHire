"use client";

import { useState } from "react";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  job: string;
  status: "ACTIVE" | "DRAFT" | "COMPLETED" | "PAUSED";
  sent: number;
  opened: number;
  replied: number;
  createdAt: string;
}

const sampleCampaigns: Campaign[] = [
  { id: "1", name: "Senior FE Outreach - Batch 1", job: "Senior Frontend Engineer", status: "ACTIVE", sent: 120, opened: 78, replied: 24, createdAt: "2024-03-15" },
  { id: "2", name: "PM Sourcing Campaign", job: "Product Manager", status: "ACTIVE", sent: 85, opened: 52, replied: 15, createdAt: "2024-03-12" },
  { id: "3", name: "Backend Eng - LinkedIn", job: "Backend Engineer", status: "COMPLETED", sent: 200, opened: 134, replied: 42, createdAt: "2024-02-28" },
  { id: "4", name: "UX Designer Talent Pool", job: "UX Designer", status: "DRAFT", sent: 0, opened: 0, replied: 0, createdAt: "2024-03-20" },
  { id: "5", name: "DevOps Passive Candidates", job: "DevOps Engineer", status: "PAUSED", sent: 45, opened: 28, replied: 8, createdAt: "2024-03-08" },
];

const statusColors: Record<Campaign["status"], string> = {
  ACTIVE: "bg-green-50 text-green-700",
  DRAFT: "bg-slate-100 text-slate-600",
  COMPLETED: "bg-blue-50 text-blue-700",
  PAUSED: "bg-yellow-50 text-yellow-700",
};

export default function OutreachPage() {
  const [search, setSearch] = useState("");

  const filtered = sampleCampaigns.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.job.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Outreach</h1>
          <p className="text-slate-500 mt-1">AI-powered candidate outreach campaigns</p>
        </div>
        <Link
          href="/outreach/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Campaign
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Sent</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">450</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">Open Rate</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">65%</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">Reply Rate</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">20%</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">Active Campaigns</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">2</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-slate-900" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Campaign</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Job</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Sent</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Opened</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Replied</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.job}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status]}`}>
                      {c.status.charAt(0) + c.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.sent}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.sent > 0 ? Math.round((c.opened / c.sent) * 100) + "%" : "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.sent > 0 ? Math.round((c.replied / c.sent) * 100) + "%" : "-"}</td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}