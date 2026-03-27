'use client';

import { FC, useState } from 'react';
import { formatDate } from '@/lib/utils';
import { Eye, MousePointerClick, Users, Trash2, MoreHorizontal, Copy } from 'lucide-react';
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
    company?: {
      name: string;
    };
  };
}

interface OutreachTableProps {
  posts: OutreachPost[];
  selectedPosts: string[];
  onSelectionChange: (selected: string[]) => void;
  onPostDeleted: () => void;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800' },
  SCHEDULED: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  POSTED: { bg: 'bg-green-100', text: 'text-green-800' },
  ARCHIVED: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

const platformIcons: Record<string, string> = {
  linkedin: '💼',
  reddit: '🔗',
  indeed: '🎯',
  hackerNews: '⚡',
  dribbble: '🎨',
  behance: '🎭',
  twitter: '𝕏',
  angelList: '⭐',
};

export const OutreachTable: FC<OutreachTableProps> = ({
  posts,
  selectedPosts,
  onSelectionChange,
  onPostDeleted,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    if (selectedPosts.includes(id)) {
      onSelectionChange(selectedPosts.filter(p => p !== id));
    } else {
      onSelectionChange([...selectedPosts, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(posts.map(p => p.id));
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this outreach post?')) {
      return;
    }

    setDeletingId(postId);
    try {
      const response = await fetch('/api/outreach', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [postId] }),
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Post deleted');
      onPostDeleted();
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-8">
              <input
                type="checkbox"
                checked={selectedPosts.length === posts.length && posts.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300"
              />
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Job Title</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Platforms</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Engagement</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {posts.map(post => (
            <tr key={post.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedPosts.includes(post.id)}
                  onChange={() => toggleSelect(post.id)}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </td>
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900">{post.jobPosting?.title || 'Unknown Job'}</p>
                  <p className="text-xs text-gray-600">{post.jobPosting?.company?.name}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-1">
                  {post.platforms.map(platform => (
                    <span
                      key={platform}
                      className="inline-block w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-sm font-medium hover:bg-gray-200 transition"
                      title={platform}
                    >
                      {platformIcons[platform] || '🔗'}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    statusColors[post.status]?.bg
                  } ${statusColors[post.status]?.text}`}
                >
                  {post.status === 'DRAFT' && 'Draft'}
                  {post.status === 'SCHEDULED' && 'Scheduled'}
                  {post.status === 'POSTED' && 'Posted'}
                  {post.status === 'ARCHIVED' && 'Archived'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">{post.views}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MousePointerClick className="w-4 h-4" />
                    <span className="font-medium">{post.clicks}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{post.applications}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {post.postedAt
                  ? formatDate(post.postedAt)
                  : post.scheduledAt
                  ? formatDate(post.scheduledAt)
                  : formatDate(post.createdAt)}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="p-2 hover:bg-red-50 rounded text-red-600 transition disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {posts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No outreach posts found</p>
        </div>
      )}
    </div>
  );
};
