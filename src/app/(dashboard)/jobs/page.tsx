"use client";

import { useState } from "react";
import Link from "next/link";

type JobStatus = "ACTIVE" | "DRAFT" | "CLOSED" | "PAUSED";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: JobStatus;
  applicants: number;
  postedDate: string;
}

const sampleJobs: Job[] = [
  { id: "1", title: "Senior Frontend Engineer", department: "Engineering", location: "Remote", type: "Full-time", status: "ACTIVE", applicants: 45, postedDate: "2024-03-15" },
  { id: "2", title: "Product Manager", department: "Product", location: "San Francisco, CA", type: "Full-time", status: "ACTIVE", applicants: 32, postedDate: "2024-03-12" },
  { id: "3", title: "Backend Engineer", department: "Engineering", location: "Remote", type: "Full-time", status: "ACTIVE", applicants: 28, postedDate: "2024-03-10" },
  { id: "4", title: "UX Designer", department: "Design", location: "New York, NY", type: "Full-time", status: "ACTIVE", applicants: 21, postedDate: "2024-03-08" },
  { id: "5", title: "DevOps Engineer", department: "Engineering", location: "Remote", type: "Full-time", status: "DRAFT", applicants: 0, postedDate: "2024-03-20" },
  { id: "6", title: "Marketing Manager", department: "Marketing", location: "Austin, TX", type: "Full-time", status: "CLOSED", applicants: 56, postedDate: "2024-02-15" },
  { id: "7", title: "Data Analyst", department: "Analytics", location: "Remote", type: "Contract", status: "PAUSED", applicants: 15, postedDate: "2024-03-01" },
];

const statusColors: Record<JobStatus, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  DRAFT: "bg-slate-100 text-slate-600",
  CLOSED: "bg-red-50 text-red-600",
  PAUSED: "bg-yellow-50 text-yellow-700",
};

export default function JobsPage() {
  const [filter, setFilter] = useState<"ALL" | JobStatus>("ALL");
  const [search, setSearch] = useState("");

  const filtered = sampleJobs.filter((job) => {
    const matchesFilter = filter === "ALL" || job.status === filter;
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || job.department.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
          <p className="text-slate-500 mt-1">Manage your job postings</p>
        </div>
        <Link
          href="/jobs/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Job
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-slate-900"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "ACTIVE", "DRAFT", "PAUSED", "CLOSED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === s ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Job Title</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Department</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Location</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Type</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Applicants</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/jobs/${job.id}`} className="text-sm font-medium text-slate-900 hover:text-blue-600">
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{job.department}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{job.location}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{job.type}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{job.applicants}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                      {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/jobs/${job.id}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
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
            <p className="text-slate-500">No jobs found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}