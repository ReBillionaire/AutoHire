'use client';

import {
  ArrowRight,
  BarChart3,
  Brain,
  Briefcase,
  CheckCircle2,
  Globe,
  MessageSquare,
  MousePointerClick,
  Send,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Screening',
    description: 'Automatically analyze resumes, score candidates, and surface the best matches with advanced AI.',
    color: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/20',
    iconColor: 'text-blue-500',
  },
  {
    icon: Briefcase,
    title: 'Career Pages',
    description: 'Launch branded career pages in minutes. Attract top talent with a professional job board.',
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/20',
    iconColor: 'text-emerald-500',
  },
  {
    icon: BarChart3,
    title: 'DISC Profiling',
    description: 'Assess personality traits and team fit with scientifically-backed behavioral assessments.',
    color: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'border-violet-500/20',
    iconColor: 'text-violet-500',
  },
  {
    icon: Send,
    title: 'AI Outreach',
    description: 'Generate personalized outreach at scale. Craft messages that resonate with passive candidates.',
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/20',
    iconColor: 'text-amber-500',
  },
  {
    icon: Users,
    title: 'Pipeline Management',
    description: 'Visual kanban boards to track every candidate from application to offer. Never lose context.',
    color: 'from-rose-500/20 to-pink-500/20',
    borderColor: 'border-rose-500/20',
    iconColor: 'text-rose-500',
  },
  {
    icon: MessageSquare,
    title: 'Interview Hub',
    description: 'Schedule, conduct, and evaluate interviews with structured scorecards and AI summaries.',
    color: 'from-cyan-500/20 to-sky-500/20',
    borderColor: 'border-cyan-500/20',
    iconColor: 'text-cyan-500',
  },
];

const steps = [
  {
    number: '01',
    title: 'Post & Source',
    description: 'Create job postings and let AI find the best candidates across multiple channels.',
  },
  {
    number: '02',
    title: 'Screen & Assess',
    description: 'AI analyzes resumes and runs assessments to rank candidates objectively.',
  },
  {
    number: '03',
    title: 'Interview & Evaluate',
    description: 'Structured interviews with scorecards, video analysis, and AI-powered insights.',
  },
  {
    number: '04',
    title: 'Decide & Hire',
    description: 'Comprehensive candidate profiles with AI scores make hiring decisions confident.',
  },
];

const stats = [
  { value: '73%', label: 'Faster time to hire' },
  { value: '2.4x', label: 'More qualified candidates' },
  { value: '91%', label: 'Recruiter satisfaction' },
  { value: '50%', label: 'Less screening time' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">AutoHire</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gap-1.5">
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-radial-top" />
        <div className="absolute inset-0 bg-grid opacity-40" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm text-primary animate-fade-in-up">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-medium">AI-powered hiring platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] animate-fade-in-up stagger-1">
              Hire smarter.{' '}
              <span className="gradient-text">Hire faster.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
              Screen candidates with AI, run structured assessments, and make confident
              hiring decisions — all from one beautiful platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up stagger-3">
              <Link href="/register">
                <Button size="lg" className="gap-2 h-12 px-8 text-[15px] shadow-glow-sm hover:shadow-glow-md transition-shadow">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-[15px]"
                >
                  View Demo
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground animate-fade-in-up stagger-4">
              Free 14-day trial &middot; No credit card required
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 md:mt-20 relative animate-fade-in-up stagger-5">
            <div className="relative rounded-xl border border-border/80 bg-card shadow-elevation-4 overflow-hidden">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-muted text-xs text-muted-foreground font-mono">
                    app.autohire.ai/dashboard
                  </div>
                </div>
              </div>
              {/* Dashboard mock */}
              <div className="p-6 md:p-8 space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Open Jobs', value: '12', trend: '+3', icon: Briefcase },
                    { label: 'Candidates', value: '284', trend: '+47', icon: Users },
                    { label: 'Interviews', value: '18', trend: '+6', icon: MessageSquare },
                    { label: 'Hire Rate', value: '34%', trend: '+8%', icon: TrendingUp },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-lg border border-border bg-background/50">
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-emerald-500 font-medium">{stat.trend}</span>
                      </div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
                {/* Chart placeholder */}
                <div className="h-32 md:h-48 rounded-lg border border-border bg-muted/20 flex items-end px-8 pb-4 gap-2">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/20 rounded-t-sm"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Gradient fade at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <div key={i} className="text-center space-y-1">
                <p className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything you need to hire better
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete hiring toolkit that replaces your scattered tools with one intelligent platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className={`group p-6 rounded-xl border ${feature.borderColor} bg-card hover:shadow-elevation-2 transition-all duration-300`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              From posting to hiring in 4 steps
            </h2>
            <p className="text-lg text-muted-foreground">
              A streamlined process that turns weeks into days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-5 left-[calc(50%+28px)] w-[calc(100%-56px)] h-px bg-border" />
                )}
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{step.number}</span>
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-10 md:p-16 text-center overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-radial-top opacity-50" />

          <div className="relative space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to transform your hiring?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join teams who hire 73% faster with AutoHire. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register">
                <Button size="lg" className="gap-2 h-12 px-8 text-[15px] shadow-glow-sm hover:shadow-glow-md transition-shadow">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Free 14-day trial &middot; No credit card required &middot; Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-semibold">AutoHire</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered hiring platform for modern teams.
              </p>
            </div>
            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Security', 'Integrations'],
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers', 'Press'],
              },
              {
                title: 'Legal',
                links: ['Privacy', 'Terms', 'Cookie Policy'],
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; 2026 AutoHire. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
              <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
