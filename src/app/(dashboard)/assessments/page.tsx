"use client";

import { useState } from "react";
import Link from "next/link";

interface Assessment {
  id: string;
  title: string;
  type: "TECHNICAL" | "BEHAVIORAL" | "DISC" | "COGNITIVE" | "CUSTOM";
  job: string;
  candidates: number;
  completed: number;
  avgScore: number;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  createdAt: string;
}

const sampleAssessments: Assessment[] = [
  { id: "1", title: "React & TypeScript Coding Challenge", type: "TECHNICAL", job: "Senior Frontend Engineer", candidates: 45, completed: 32, avgScore: 72, status: "ACTIVE", createdAt: "2024-03-10" },
  { id: "2", title: "Product Sense Case Study", type: "BEHAVIORAL", job: "Product Manager", candidates: 28, completed: 20, avgScore: 68, status: "ACTIVE", createdAt: "2024-03-08" },
  { id: "3", title: "DISC Personality Profile", type: "DISC", job: "All Roles", candidates: 120, completed: 95, avgScore: 0, status: "ACTIVE", createdAt: "2024-02-15" },
  { id: "4", title: "System Design Assessment", type: "TECHNICAL", job: "Backend Engineer", candidates: 30, completed: 22, avgScore: 65, status: "ACTIVE", createdAt: "2024-03-05" },
  { id: "5", title: "Cognitive Ability Test", type: "COGNITIVE", job: "All Roles", candidates: 80, completed: 65, avgScore: 74, status: "ACTIVE", createdAt: "2024-02-20" },
  { id: "6", title: "Design Portfolio Review", type: "CUSTOM", job: "UX Designer", candidates: 0, completed: 0, avgScore: 0, status: "DRAFT", createdAt: "2024-03-18" },
];

const typeColors: Record<Assessment["type"], string> = {
  TECHNICAL: "bg-blue-50 text-blue-700",
  BEHAVIORAL: "bg-purple-50 text-purple-700",
  DISC: "bg-amber-50 text-amber-700",
  COGNITIVE: "bg-green-50 text-green-700",
  CUSTOM: "bg-slate-100 text-slate-700",
};

export default function AssessmentsPage() {
  const [filter, setFilter] = useState("ALL");

  const filtered = sampleAssessments.filter(a => filter === "ALL" || a.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assessments</h1>
          <p className="text-slate-500 mt-1">Create and manage candidate assessments</p>
        </div>
        <Link
          href="/assessments/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Assessment
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["ALL", "TECHNICAL", "BEHAVIORAL", "DISC", "COGNITIVE", "CUSTOM"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === t ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {t === "ALL" ? "All Types" : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((assessment) => (
          <div key={assessment.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between mb-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[assessment.type]}`}>
                {assessment.type}
              </span>
              <span className={`text-xs font-medium ${assessment.status === "ACTIVE" ? "text-green-600" : assessment.status === "DRAFT" ? "text-slate-400" : "text-red-500"}`}>
                {assessment.status.charAt(0) + assessment.status.slice(1).toLowerCase()}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">{assessment.title}</h3>
            <p className="text-xs text-slate-500 mb-4">For: {assessment.job}</p>
            
            <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
              <span>{assessment.completed}/{assessment.candidates} completed</span>
              {assessment.avgScore > 0 && <span>Avg: <strong className="text-slate-700">{assessment.avgScore}%</strong></span>}
            </div>
            
            {assessment.candidates > 0 && (
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(assessment.completed / assessment.candidates) * 100}%` }} />
              </div>
            )}

            <Link href={`/assessments/${assessment.id}/results`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {assessment.status === "DRAFT" ? "Edit Assessment" : "View Results"}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}