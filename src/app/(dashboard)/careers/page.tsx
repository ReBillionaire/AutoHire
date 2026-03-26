"use client";

import { useState } from "react";

export default function CareersPage() {
  const [settings, setSettings] = useState({
    enabled: true,
    companyName: "Acme Inc.",
    headline: "Join Our Team",
    description: "We are building the future of technology. Come work with amazing people on challenging problems.",
    brandColor: "#3B82F6",
    showLogo: true,
  });

  const activeJobs = [
    { title: "Senior Frontend Engineer", department: "Engineering", location: "Remote", type: "Full-time", applicants: 45 },
    { title: "Product Manager", department: "Product", location: "San Francisco", type: "Full-time", applicants: 32 },
    { title: "Backend Engineer", department: "Engineering", location: "Remote", type: "Full-time", applicants: 28 },
    { title: "UX Designer", department: "Design", location: "New York", type: "Full-time", applicants: 21 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Career Page</h1>
          <p className="text-slate-500 mt-1">Customize your public career page</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Preview
          </a>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`relative w-11 h-6 rounded-full transition-colors ${settings.enabled ? "bg-blue-600" : "bg-slate-300"}`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.enabled ? "translate-x-5" : ""}`} />
              <input type="checkbox" checked={settings.enabled} onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })} className="sr-only" />
            </div>
            <span className="text-sm font-medium text-slate-700">{settings.enabled ? "Live" : "Offline"}</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Page Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
                <input type="text" value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Headline</label>
                <input type="text" value={settings.headline} onChange={(e) => setSettings({ ...settings, headline: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea value={settings.description} onChange={(e) => setSettings({ ...settings, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-slate-900 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.brandColor} onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })} className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer" />
                  <input type="text" value={settings.brandColor} onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })} className="w-28 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 font-mono" />
                </div>
              </div>
              <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all text-sm">
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase">Live Preview</p>
          </div>
          <div className="p-6">
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="p-8 text-center" style={{ backgroundColor: settings.brandColor + "10" }}>
                <h2 className="text-xl font-bold text-slate-900">{settings.headline}</h2>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">{settings.description}</p>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase mb-3">Open Positions ({activeJobs.length})</p>
                {activeJobs.map((job, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{job.title}</p>
                      <p className="text-xs text-slate-500">{job.department} · {job.location} · {job.type}</p>
                    </div>
                    <button className="text-xs font-medium px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: settings.brandColor }}>
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}