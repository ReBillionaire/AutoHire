'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            AutoHire
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-300 hover:text-white px-4 py-2 rounded-md transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 space-y-12">
        <div className="space-y-8 text-center">
          <h1 className="text-6xl md:text-7xl font-bold leading-tight">
            Hire Smarter with{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              AI
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
            Streamline your recruitment with AI-powered assessments, intelligent matching, and
            comprehensive interview management. Build your dream team faster.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md transition-colors font-medium text-lg inline-flex items-center gap-2">
              Get Started Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <button className="border border-slate-600 text-white hover:bg-slate-800 px-8 py-3 rounded-md transition-colors font-medium text-lg">
              View Demo
            </button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative h-72 md:h-96 bg-gradient-to-br from-blue-500/10 via-slate-700/10 to-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="w-20 h-20 mx-auto rounded-lg bg-gradient-to-br from-blue-400/20 to-cyan-400/20 border border-blue-400/30 flex items-center justify-center text-4xl">
              ⚡
            </div>
            <p className="text-slate-400">AI-Powered Recruitment Dashboard</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Powerful Features for Modern Hiring</h2>
          <p className="text-xl text-slate-400">Everything you need to hire faster and smarter</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: 'AI Outreach', desc: 'Automatically generate personalized outreach messages to top candidates.', icon: '⚡' },
            { title: 'Career Pages', desc: 'Create beautiful, branded career pages that attract qualified candidates.', icon: '💼' },
            { title: 'Smart Assessments', desc: 'AI-powered assessments that evaluate candidates accurately and fairly.', icon: '🧠' },
            { title: 'DISC Profiling', desc: 'Understand candidate personality and team fit with DISC analysis.', icon: '📊' },
            { title: 'Pipeline Management', desc: 'Visualize and manage your entire recruitment pipeline in one place.', icon: '👥' },
            { title: 'Interview Hub', desc: 'Schedule, conduct, and track all interviews with built-in feedback tools.', icon: '✅' },
          ].map((f, i) => (
            <div key={i} className="p-8 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800/60 transition-colors hover:border-slate-600 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400/20 to-cyan-400/20 border border-blue-400/30 flex items-center justify-center text-2xl">
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-r from-blue-600/30 via-cyan-600/30 to-teal-600/30 border border-blue-500/50 rounded-2xl p-12 text-center space-y-6">
          <h2 className="text-4xl font-bold">Ready to Transform Your Hiring?</h2>
          <p className="text-lg text-slate-300">Join hundreds of companies hiring smarter with AutoHire.</p>
          <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md transition-colors font-medium text-lg inline-flex items-center gap-2">
            Start Free Trial
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between text-slate-400">
            <p>&copy; 2026 AutoHire. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
