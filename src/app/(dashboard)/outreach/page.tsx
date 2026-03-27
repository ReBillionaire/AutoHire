'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { OutreachTable } from '@/components/outreach/outreach-table';
import { Plus, Megaphone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const PLATFORMS = ['linkedin', 'reddit', 'indeed', 'hackerNews', 'dribbble', 'behance', 'twitter', 'angelList'];

interface OutreachPost {
  id: string;
  title: string;
  jobPostingId: string;
  status: 'DRAFT' | 'SCHEDULED' | 'POSTED' | 'ARCHIVED';
  platforms: string[];
  scheduledAt?: string;
  postedAt?: string;
  views: number;
  clicks: number;
  applications: number;
  createdAt: string;
  jobPosting?: {
    title: string;
    company?: { name: string };
  };
}

interface ApiResponse {
  posts: OutreachPost[];
  total: number;
  error?: string;
}

export default function OutreachPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'scheduled' | 'posted'>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  const { data, isLoading, error, refetch } = useQuery<ApiResponse>({
    queryKey: ['outreach-posts', activeTab, platformFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('status', activeTab.toUpperCase());
      if (platformFilter !== 'all') params.append('platform', platformFilter);
      const response = await fetch(`/api/outreach?${params}`);
      if (!response.ok) throw new Error('Failed to fetch outreach posts');
      return response.json();
    },
    staleTime: 30000,
  });

  const posts = data?.posts || [];
  const draftCount = posts.filter(p => p.status === 'DRAFT').length;
  const scheduledCount = posts.filter(p => p.status === 'SCHEDULED').length;
  const postedCount = posts.filter(p => p.status === 'POSTED').length;

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;
    if (!confirm(`Delete ${selectedPosts.length} post(s)?`)) return;
    try {
      const response = await fetch('/api/outreach', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedPosts }),
      });
      if (!response.ok) throw new Error('Failed to delete');
      toast.success(`Deleted ${selectedPosts.length} post(s)`);
      setSelectedPosts([]);
      refetch();
    } catch { toast.error('Failed to delete posts'); }
  };

  const handleBulkArchive = async () => {
    if (selectedPosts.length === 0) return;
    try {
      const response = await fetch('/api/outreach', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedPosts, status: 'ARCHIVED' }),
      });
      if (!response.ok) throw new Error('Failed to archive');
      toast.success(`Archived ${selectedPosts.length} post(s)`);
      setSelectedPosts([]);
      refetch();
    } catch { toast.error('Failed to archive posts'); }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Outreach</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Distribute job postings across platforms with AI-optimized content.
          </p>
        </div>
        <Button size="sm" onClick={() => router.push('/outreach/create')} className="gap-1.5 h-9 text-sm">
          <Plus className="w-3.5 h-3.5" />
          Create Post
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
          <p className="text-sm text-destructive">Error loading outreach posts: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      )}

      {/* Bulk actions */}
      {selectedPosts.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
          <span className="text-sm font-medium text-foreground">{selectedPosts.length} selected</span>
          <div className="flex-1" />
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleBulkArchive}>Archive</Button>
          <Button size="sm" variant="outline" className="h-8 text-xs text-destructive hover:text-destructive" onClick={handleBulkDelete}>Delete</Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setSelectedPosts([])}>Clear</Button>
        </div>
      )}

      {/* Filters + Tabs */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-full md:w-44 h-9 text-sm">
            <SelectValue placeholder="All Platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {PLATFORMS.map(p => (
              <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as any)}>
        <TabsList className="bg-muted/50 p-0.5 rounded-lg h-auto w-auto inline-flex">
          <TabsTrigger value="all" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">All</TabsTrigger>
          <TabsTrigger value="draft" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">
            Drafts <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-md bg-muted">{draftCount}</span>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">
            Scheduled <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">{scheduledCount}</span>
          </TabsTrigger>
          <TabsTrigger value="posted" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">
            Posted <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{postedCount}</span>
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <TabsContent value={activeTab} className="mt-5">
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {activeTab === 'all' ? 'No outreach posts yet' : `No ${activeTab} posts`}
              </p>
              <p className="text-xs text-muted-foreground mb-4">Create your first post to start distributing jobs.</p>
              <Button size="sm" variant="outline" onClick={() => router.push('/outreach/create')}>
                Create your first post
              </Button>
            </div>
          </TabsContent>
        ) : (
          <TabsContent value={activeTab} className="mt-5">
            <OutreachTable
              posts={posts}
              selectedPosts={selectedPosts}
              onSelectionChange={setSelectedPosts}
              onPostDeleted={refetch}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
