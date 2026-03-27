'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar — hidden on mobile, shown on md+ */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
