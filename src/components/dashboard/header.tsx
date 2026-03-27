'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Command,
  LogOut,
  Search,
  Settings,
  User,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MobileSidebar } from './sidebar';

// Map routes to page names
const routeNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/jobs': 'Jobs',
  '/candidates': 'Candidates',
  '/pipeline': 'Pipeline',
  '/outreach': 'Outreach',
  '/assessments': 'Assessments',
  '/interviews': 'Interviews',
  '/careers': 'Careers',
  '/settings': 'Settings',
};

function getPageName(pathname: string): string {
  for (const [route, name] of Object.entries(routeNames)) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return name;
    }
  }
  return 'Dashboard';
}

export function Header() {
  const pathname = usePathname();
  const pageName = getPageName(pathname);

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-4 md:px-6 gap-4">
        {/* Left: Mobile menu + Breadcrumb */}
        <div className="flex items-center gap-3">
          <MobileSidebar />
          <nav className="flex items-center gap-1.5 text-sm">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
            >
              Home
            </Link>
            {pageName !== 'Dashboard' && (
              <>
                <span className="text-border hidden sm:inline">/</span>
                <span className="font-medium text-foreground">
                  {pageName}
                </span>
              </>
            )}
            {pageName === 'Dashboard' && (
              <span className="font-medium text-foreground sm:hidden">
                Dashboard
              </span>
            )}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 pr-10 w-56 h-9 text-sm bg-muted/50 border-transparent hover:border-border focus:border-primary focus:bg-background transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </div>
          </div>

          {/* Mobile search */}
          <button className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <Search className="w-[18px] h-[18px]" />
          </button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h4 className="text-sm font-semibold">Notifications</h4>
                <button className="text-xs text-primary hover:underline">
                  Mark all read
                </button>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                <div className="p-1">
                  <p className="px-3 py-8 text-sm text-center text-muted-foreground">
                    No new notifications
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Separator */}
          <div className="hidden md:block w-px h-6 bg-border mx-1" />

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent transition-colors">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" />
                  <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                    AD
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium text-foreground">
                  Admin
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">admin@autohire.ai</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
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
      </div>
    </header>
  );
}
