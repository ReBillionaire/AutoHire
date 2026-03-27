'use client';

import Link from 'next/link';
import { Edit, Copy, Archive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface Job {
  id: string;
  title: string;
  department: string;
  status: 'active' | 'draft' | 'archived';
  postedAt: string;
  applicationCount: number;
}

interface JobsTableProps {
  jobs: Job[];
  onDuplicate?: (jobId: string) => void;
  onArchive?: (jobId: string) => void;
  onDelete?: (jobId: string) => void;
}

export function JobsTable({
  jobs,
  onDuplicate,
  onArchive,
  onDelete,
}: JobsTableProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                Title
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                Department
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                Status
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                Applications
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                Posted
              </th>
              <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="py-4 px-4">
                  <Link href={`/dashboard/jobs/${job.id}`}>
                    <a className="font-medium text-primary hover:underline">
                      {job.title}
                    </a>
                  </Link>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {job.department}
                </td>
                <td className="py-4 px-4">
                  <Badge variant={getStatusBadgeVariant(job.status)}>
                    {job.status}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-sm">
                  <Link href={`/dashboard/jobs/${job.id}`}>
                    <a className="text-primary hover:underline">
                      {job.applicationCount}
                    </a>
                  </Link>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {new Date(job.postedAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        ⋯
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/jobs/create?id=${job.id}`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      {onDuplicate && (
                        <DropdownMenuItem onClick={() => onDuplicate(job.id)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      {onArchive && (
                        <DropdownMenuItem onClick={() => onArchive(job.id)}>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(job.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
