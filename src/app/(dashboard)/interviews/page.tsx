"use client";

import { useState } from "react";
import Link from "next/link";

interface Interview {
  id: string;
  candidateName: string;
  candidateRole: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  interviewers: string[];
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  meetingLink?: string;
}

const sampleInterviews: Interview[] = [
  { id: "1", candidateName: "Sarah Chen", candidateRole: "Senior Frontend Engineer", type: "Technical", date: "2024-03-26", time: "10:00 AM", duration: "60 min", interviewers: ["John Smith", "Alice Lee"], status: "SCHEDULED", meetingLink: "#" },
  { id: "2", candidateName: "James Park", candidateRole: "Product Manager", type: "Behavioral", date: "2024-03-26", time: "2:00 PM", duration: "45 min", interviewers: ["Bob Davis"], status: "SCHEDULED", meetingLink: "#" },
  { id: "3", candidateName: "Lisa Wang", candidateRole: "Product Manager", type: "Case Study", date: "2024-03-27", time: "11:00 AM", duration: "60 min", interviewers: ["Carol White", "Dave Brown"], status: "SCHEDULED", meetingLink: "#" },
  { id: "4", candidateName: "Tom Wilson", candidateRole: "Backend Engineer", type: "System Design", date: "2024-03-27", time: "3:00 PM", duration: "90 min", interviewers: ["Eve Green"], status: "SCHEDULED", meetingLink: "#" },
  { id: "5", candidateName: "Maria Garcia", candidateRole: "Backend Engineer", type: "Technical", date: "2024-03-22", time: "10:00 AM", duration: "60 min", interviewers: ["John Smith"], status: "COMPLETED" },
  { id: "6", candidateName: "Alex Johnson", candidateRole: "Backend Engineer", type: "Final Round", date: "2024-03-20", time: "2:00 PM", duration: "45 min", interviewers: ["CEO"], status: "COMPLETED" },
  { id: "7", candidateName: "Nina Patel", candidateRole: "Data Analyst", type: "Technical", date: "2024-03-19", time: "11:00 AM", duration: "60 min", interviewers: ["Frank Hill"], status: "COMPLETED" },
  { id: "8", candidateName: "Ryan Lee", candidateRole: "Frontend Engineer", type: "Phone Screen", date: "2024-03-25", time: "9:00 AM", duration: "30 min", interviewers: ["Alice Lee"], status: "CANCELLED" },
];

const statusConfig: Record<Interview["status"], { color: string; label: string }> = {
  SCHEDULED: { color: "bg-blue-50 text-blue-700", label: "Scheduled" },
  COMPLETED: { color: "bg-green-50 text-green-700", label: "Completed" },
  CANCELLED: { color: "bg-red-50 text-red-600", label: "Cancelled" },
  NO_SHOW: { color: "bg-yellow-50 text-yellow-700", label: "No Show" },
};

export default function InterviewsPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const upcoming = sampleInterviews.filter(i => i.status === "SCHEDULED");
  const past = sampleInterviews.filter(i => i.status !== "SCHEDULED");
  const displayed = tab === "upcoming" ? upcoming : past;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Interviews</h1>
          <p className="text-slate-500 mt-1">{upcoming.length} upcoming interviews</p>
        </div>
        <Link
          href="/interviews/schedule"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Schedule Interview
        </Link>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("upcoming")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "upcoming" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          onClick={() => setTab("past")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "past" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
        >
          Past ({past.length})
        </button>
      </div>

      <div className="space-y-3">
        {displayed.map((interview) => (
          <div key={interview.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {interview.candidateName.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{interview.candidateName}</h3>
                  <p className="text-xs text-slate-500">{interview.candidateRole}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(interview.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {interview.time} ({interview.duration})
                    </span>
                    <span className="text-xs text-slate-500">
                      {interview.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Interviewers: {interview.interviewers.join(", ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[interview.status].color}`}>
                  {statusConfig[interview.status].label}
                </span>
                {interview.meetingLink && interview.status === "SCHEDULED" && (
                  <a href={interview.meetingLink} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Join Meeting
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}

        {displayed.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 py-12 text-center">
            <p className="text-slate-500">No {tab} interviews</p>
          </div>
        )}
      </div>
    </div>
  );
}