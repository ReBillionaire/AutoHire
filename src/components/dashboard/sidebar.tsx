'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Globe,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Menu,
  Send,
  Settings,
  Users,
  X,
  Sparkles,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Recruitment',
    items: [
      { label: 'Jobs', href: '/jobs', icon: Briefcase },
      { label: 'Candidates', href: '/candidates', icon: Users },
      { label: 'Pipeline', href: '/pipeline', icon: GitBranch },
      { label: 'Outreach', href: '/outreach', icon: Send },
    ],
  },
  {
    title: 'Evaluation',
    items: [
      { label: 'Assessments', href: '/assessments', icon: ClipboardCheck },
      { label: 'Interviews', href: '/interviews', icon: Calendar },
    ],
  },
  {
    title: 'Publish',
    items: [
      { label: 'Careers', href: '/careers', icon: Globe },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-sidebar-border ${isCollapsed ? 'px-3 justify-center' : 'px-5 justify-between'}`}>
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="text-[15px] font-semibold text-foreground tracking-tight truncate">
              AutoHire
            </span>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ${
            isCollapsed ? 'hidden' : ''
          }`}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <div className="flex justify-center py-2">
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scroll-hide py-3 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            {!isCollapsed && (
              <div className="px-5 mb-1.5">
                <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">
                  {section.title}
                </span>
              </div>
            )}
            <div className={`space-y-0.5 ${isCollapsed ? 'px-2' : 'px-3'}`}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-lg transition-all duration-150 ${
                      isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
                    } ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`flex-shrink-0 transition-colors ${
                      active ? 'w-[18px] h-[18px]' : 'w-[18px] h-[18px] group-hover:text-foreground'
                    }`} />
                    {!isCollapsed && (
                      <span className="text-[13px] font-medium truncate">
                        {item.label}
                      </span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className={`ml-auto text-[11px] font-medium px-1.5 py-0.5 rounded-full ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className={`border-t border-sidebar-border ${isCollapsed ? 'p-2' : 'p-3'}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`w-full flex items-center gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-accent ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" />
                <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                  AD
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    Admin User
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    admin@autohire.ai
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@autohire.ai</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

// Mobile sidebar overlay
export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-sidebar border-r border-sidebar-border animate-slide-in-left">
            {/* Close button */}
            <div className="flex items-center justify-between h-16 px-5 border-b border-sidebar-border">
              <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-[15px] font-semibold text-foreground tracking-tight">
                  AutoHire
                </span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3 space-y-5">
              {navSections.map((section) => (
                <div key={section.title}>
                  <div className="px-5 mb-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">
                      {section.title}
                    </span>
                  </div>
                  <div className="space-y-0.5 px-3">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                            active
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          }`}
                        >
                          <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                          <span className="text-[13px] font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
