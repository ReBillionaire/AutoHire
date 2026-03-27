'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Trash2, Eye, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

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

interface OutreachTableProps {
  posts: OutreachPost[];
  selectedPosts: string[];
  onSelectionChange: (ids: string[]) => void;
  onPostDeleted: () => void;
}

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  SCHEDULED: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  POSTED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  ARCHIVED: 'bg-muted text-muted-foreground',
};

export function OutreachTable({ posts, selectedPosts, onSelectionChange, onPostDeleted }: OutreachTableProps) {
  const allSelected = posts.length > 0 && selectedPosts.length === posts.length;

  const toggleAll = () => {
    onSelectionChange(allSelected ? [] : posts.map((p) => p.id));
  };

  const toggleOne = (id: string) => {
    onSelectionChange(
      selectedPosts.includes(id)
        ? selectedPosts.filter((i) => i !== id)
        : [...selectedPosts, id]
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this outreach post?')) return;
    try {
      const response = await fetch('/api/outreach', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
      if (!response.ok) throw new Error('Failed to delete');
      toast.success('Post deleted');
      onPostDeleted();
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '\u2014';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Title</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Platforms</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground text-right">Views</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground text-right">Clicks</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground text-right">Apps</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Date</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground text-right pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id} className="border-border hover:bg-muted/30">
              <TableCell>
                <Checkbox
                  checked={selectedPosts.includes(post.id)}
                  onCheckedChange={() => toggleOne(post.id)}
                />
              </TableCell>
              <TableCell>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">{post.title}</p>
                  {post.jobPosting && (
                    <p className="text-[11px] text-muted-foreground truncate">{post.jobPosting.title}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {post.platforms.slice(0, 3).map((p) => (
                    <span key={p} className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                      {p}
                    </span>
                  ))}
                  {post.platforms.length > 3 && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                      +{post.platforms.length - 3}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusStyles[post.status] || 'bg-muted text-muted-foreground'}`}>
                  {post.status.charAt(0) + post.status.slice(1).toLowerCase()}
                </span>
              </TableCell>
              <TableCell className="text-right text-[13px] text-muted-foreground">{post.views.toLocaleString()}</TableCell>
              <TableCell className="text-right text-[13px] text-muted-foreground">{post.clicks.toLocaleString()}</TableCell>
              <TableCell className="text-right text-[13px] text-muted-foreground">{post.applications}</TableCell>
              <TableCell className="text-[13px] text-muted-foreground">
                {formatDate(post.postedAt || post.scheduledAt || post.createdAt)}
              </TableCell>
              <TableCell className="text-right pr-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem asChild>
                      <Link href={`/outreach/${post.id}`} className="gap-2 text-xs">
                        <Eye className="w-3 h-3" /> View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/outreach/${post.id}/analytics`} className="gap-2 text-xs">
                        <BarChart3 className="w-3 h-3" /> Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDelete(post.id)} className="gap-2 text-xs text-destructive focus:text-destructive">
                      <Trash2 className="w-3 h-3" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
