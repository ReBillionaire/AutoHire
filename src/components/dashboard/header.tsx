'use client';

import { Bell, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between pb-6">
      <div>
        {title && (
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search..."
            className="pl-10 w-64 bg-white dark:bg-slate-800"
          />
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {session?.user?.name?.charAt(0) || 'U'}
          </div>
          <span className="text-sm font-medium text-slate-900 dark:text-white hidden sm:block">
            {session?.user?.name || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
