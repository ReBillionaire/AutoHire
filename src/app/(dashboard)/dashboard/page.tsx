"use client";

import Link from "next/link";

const stats = [
  { name: "Active Jobs", value: "12", change: "+2", changeType: "positive", href: "/jobs" },
  { name: "Total Candidates", value: "248", change: "+18", changeType: "positive", href: "/candidates" },
  { name: "In Pipeline", value: "64", change: "+5", changeType: "positive", href: "/pipeline" },
  { name: "Interviews This Week", value: "8", change: "-1", changeType: "negative", href: "/interviews" },
];

const recentActivity = [
  { id: 1, type: "application", message: "Sarah Chen applied for Senior Frontend Engineer", time: "2 hours ago", icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" },
  { id: 2, type: "interview", message: "Interview scheduled with James Park for Product Manager", time: "3 hours ago", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { id: 3, type: "stage", message: "Maria Garcia moved to Technical Interview stage", time: "5 hours ago", icon: "M9 5l7 7-7 7" },
  { id: 4, type: "offer", message: "Offer sent to Alex Johnson for Backend Engineer", time: "1 day ago", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: 5, type: "assessment", message: "Technical assessment completed by David Kim", time: "1 day ago", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
];

const pipelineStages = [
  { name: "Applied", count: 32, color: "bg-slate-400" },
  { name: "Screening", count: 18, color: "bg-blue-400" },
  { name: "Interview", count: 12, color: "bg-indigo-500" },
  { name: "Assessment", count: 8, color: "bg-purple-500" },
  { name: "Offer", count: 4, color: "bg-green-500" },
  { name: "Hired", count: 2, color: "bg-emerald-600" },
];

const topJobs = [
  { title: "Senior Frontend Engineer", applicants: 45, new: 8, status: "Active" },
  { title: "Product Manager", applicants: 32, new: 5, status: "Active" },
  { title: "Backend Engineer", applicants: 28, new: 3, status: "Active" },
  { title: "UX Designer", applicants: 21, new: 6, status: "Active" },
];

export default function DashboardPage() {
  const maxPipeline = Math.max(...pipelineStages.map(s => s.count));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your hiring pipeline</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <p className="text-sm font-medium text-slate-500">{stat.name}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <span className={`text-sm font-medium ${stat.changeType === "positive" ? "text-green-600" : "text-red-500"}`}>
                {stat.change}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Pipeline Overview</h2>
            <Link href="/pipeline" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {pipelineStages.map((stage) => (
              <div key={stage.name} className="flex items-center gap-4">
                <span className="w-24 text-sm text-slate-600 font-medium">{stage.name}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-8 relative overflow-hidden">
                  <div
                    className={`${stage.color} h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500`}
                    style={{ width: `${(stage.count / maxPipeline) * 100}%` }}
                  >
                    <span className="text-white text-xs font-bold">{stage.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={activity.icon} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-700 line-clamp-2">{activity.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Jobs */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Top Active Jobs</h2>
          <Link href="/jobs" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all jobs
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Job Title</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Applicants</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">New</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topJobs.map((job) => (
                <tr key={job.title} className="hover:bg-slate-50">
                  <td className="py-3 text-sm font-medium text-slate-900">{job.title}</td>
                  <td className="py-3 text-sm text-slate-600">{job.applicants}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      +{job.new}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      {job.status}
                    </span>
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