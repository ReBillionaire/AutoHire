"use client";

import { useState } from "react";
import Link from "next/link";

interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  stage: string;
  score: number;
  appliedDate: string;
  source: string;
}

const sampleCandidates: Candidate[] = [
  { id: "1", name: "Sarah Chen", email: "sarah@example.com", role: "Senior Frontend Engineer", stage: "Technical Interview", score: 92, appliedDate: "2024-03-18", source: "LinkedIn" },
  { id: "2", name: "James Park", email: "james@example.com", role: "Product Manager", stage: "Phone Screen", score: 85, appliedDate: "2024-03-17", source: "Referral" },
  { id: "3", name: "Maria Garcia", email: "maria@example.com", role: "Backend Engineer", stage: "Assessment", score: 88, appliedDate: "2024-03-16", source: "Career Page" },
  { id: "4", name: "Alex Johnson", email: "alex@example.com", role: "Backend Engineer", stage: "Offer", score: 95, appliedDate: "2024-03-10", source: "LinkedIn" },
  { id: "5", name: "David Kim", email: "david@example.com", role: "UX Designer", stage: "Applied", score: 78, appliedDate: "2024-03-19", source: "Indeed" },
  { id: "6", name: "Emily Wright", email: "emily@example.com", role: "Senior Frontend Engineer", stage: "Phone Screen", score: 82, appliedDate: "2024-03-18", source: "AngelList" },
  { id: "7", name: "Michael Brown", email: "michael@example.com", role: "DevOps Engineer", stage: "Applied", score: 74, appliedDate: "2024-03-19", source: "Career Page" },
  { id: "8", name: "Lisa Wang", email: "lisa@example.com", role: "Product Manager", stage: "Technical Interview", score: 90, appliedDate: "2024-03-14", source: "Referral" },
];

const stageColors: Record<string, string> = {
  "Applied": "bg-slate-100 text-slate-700",
  "Phone Screen": "bg-blue-50 text-blue-700",
  "Technical Interview": "bg-indigo-50 text-indigo-700",
  "Assessment": "bg-purple-50 text-purple-700",
  "Offer": "bg-green-50 text-green-700",
  "Hired": "bg-emerald-50 text-emerald-700",
  "Rejected": "bg-red-50 text-red-600",
};

function getScoreColor(score: number) {
  if (score >= 90) return "text-green-600 bg-green-50";
  if (score >= 80) return "text-blue-600 bg-blue-50";
  if (score >= 70) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
}

export default function CandidatesPage() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");

  const stages = ["ALL", "Applied", "Phone Screen", "Technical Interview", "Assessment", "Offer"];
  
  const filtered = sampleCandidates.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "ALL" || c.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
          <p className="text-slate-500 mt-1">{sampleCandidates.length} total candidates</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-slate-900"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
        >
          {stages.map((s) => (
            <option key={s} value={s}>{s === "ALL" ? "All Stages" : s}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Candidate</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Applied For</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Stage</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">AI Score</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Source</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Applied</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {c.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.role}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColors[c.stage] || "bg-slate-100 text-slate-600"}`}>
                      {c.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${getScoreColor(c.score)}`}>
                      {c.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.source}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(c.appliedDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <Link href={`/candidates/${c.id}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-slate-500">No candidates found</p>
          </div>
        )}
      </div>
    </div>
  );
}