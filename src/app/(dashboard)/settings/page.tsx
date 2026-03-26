"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    role: "Admin",
  });

  const [company, setCompany] = useState({
    name: "Acme Inc.",
    website: "https://acme.com",
    industry: "Technology",
    size: "50-200",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "company", label: "Company" },
    { id: "notifications", label: "Notifications" },
    { id: "integrations", label: "Integrations" },
    { id: "billing", label: "Billing" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Settings saved successfully
        </div>
      )}

      {activeTab === "profile" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Profile Settings</h2>
          <div className="space-y-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {profile.name?.charAt(0) || "U"}
              </div>
              <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                Change Photo
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <input
                type="text"
                value={profile.role}
                disabled
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500"
              />
            </div>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all text-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {activeTab === "company" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Company Settings</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
              <input type="text" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
              <input type="url" value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
              <select value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-slate-700">
                <option>Technology</option><option>Healthcare</option><option>Finance</option><option>Education</option><option>Retail</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Size</label>
              <select value={company.size} onChange={(e) => setCompany({ ...company, size: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-slate-700">
                <option>1-10</option><option>11-50</option><option>50-200</option><option>200-500</option><option>500+</option>
              </select>
            </div>
            <button onClick={handleSave} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all text-sm">
              Save Changes
            </button>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { label: "New applications", desc: "Get notified when someone applies to a job" },
              { label: "Interview reminders", desc: "Receive reminders before scheduled interviews" },
              { label: "Pipeline updates", desc: "When candidates move between stages" },
              { label: "Assessment completions", desc: "When a candidate completes an assessment" },
              { label: "Weekly digest", desc: "Summary of hiring activity each week" },
            ].map((item, i) => (
              <label key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <input type="checkbox" defaultChecked={i < 3} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
              </label>
            ))}
            <button onClick={handleSave} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all text-sm mt-4">
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {activeTab === "integrations" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Integrations</h2>
          <div className="space-y-4">
            {[
              { name: "Google Calendar", desc: "Sync interviews with your calendar", connected: true },
              { name: "Slack", desc: "Get notifications in your Slack workspace", connected: false },
              { name: "LinkedIn", desc: "Import candidate profiles", connected: true },
              { name: "GitHub", desc: "Verify candidate code contributions", connected: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <button className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  item.connected ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                }`}>
                  {item.connected ? "Connected" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "billing" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Billing</h2>
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-900">Pro Plan</p>
                <p className="text-xs text-blue-700">Unlimited jobs, AI features, team members</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">$99<span className="text-sm font-normal">/mo</span></p>
            </div>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Manage Subscription
          </button>
        </div>
      )}
    </div>
  );
}