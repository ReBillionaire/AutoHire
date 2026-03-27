import Link from 'next/link';
import { MapPin, Briefcase, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  workMode: 'remote' | 'hybrid' | 'on-site';
  postedAt: string;
  slug: string;
  salary?: {
    min: number;
    max: number;
  };
}

interface JobCardProps {
  job: Job;
  orgSlug: string;
}

export function JobCard({ job, orgSlug }: JobCardProps) {
  const postedDaysAgo = Math.floor(
    (Date.now() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const getPostedLabel = () => {
    if (postedDaysAgo === 0) return 'Posted today';
    if (postedDaysAgo === 1) return 'Posted yesterday';
    return `Posted ${postedDaysAgo} days ago`;
  };

  return (
    <Link href={`/careers/${orgSlug}/${job.slug}`}>
      <div className="border rounded-lg p-6 hover:shadow-lg hover:border-primary transition-all group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            <p className="text-gray-600 text-sm mt-1">{job.department}</p>
          </div>
          <span className="text-xs font-medium text-gray-500 whitespace-nowrap ml-4">
            {getPostedLabel()}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            {job.location}
          </div>

          <div className="flex items-center text-gray-600 text-sm">
            <Briefcase className="w-4 h-4 mr-1 flex-shrink-0" />
            {job.type.replace('-', ' ')}
          </div>

          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
            {job.workMode}
          </div>

          {job.salary && (
            <div className="flex items-center text-gray-600 text-sm">
              <DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />
              ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
            View Details
          </Button>
        </div>
      </div>
    </Link>
  );
}
