'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Users, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
  applicationCount: number;
  postedAt: string;
}

interface Application {
  id: string;
  candidateName: string;
  email: string;
  status: 'new' | 'reviewing' | 'interview' | 'rejected' | 'hired';
  submittedAt: string;
  rating?: number;
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobDetail();
  }, [params.id]);

  const fetchJobDetail = async () => {
    try {
      const [jobRes, appRes] = await Promise.all([
        fetch(`/api/jobs/${params.id}`),
        fetch(`/api/jobs/${params.id}/applications`),
      ]);

      const jobData = await jobRes.json();
      const appData = await appRes.json();

      setJob(jobData.job);
      setApplications(appData.applications);
    } catch (error) {
      console.error('Failed to fetch job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (
    status: 'new' | 'reviewing' | 'interview' | 'rejected' | 'hired'
  ) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-700';
      case 'interview':
        return 'bg-purple-100 text-purple-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'hired':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Job Not Found</h1>
          <Link href="/dashboard/jobs">
            <Button variant="outline">Back to Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/jobs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <p className="text-gray-600 mt-1">
              {job.department} • {job.location}
            </p>
          </div>
        </div>
        <Link href={`/dashboard/jobs/create?id=${job.id}`}>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-6">
          <p className="text-sm text-gray-600 font-medium mb-2">Status</p>
          <p className="text-2xl font-bold capitalize">{job.status}</p>
        </div>
        <div className="border rounded-lg p-6">
          <p className="text-sm text-gray-600 font-medium mb-2">Applications</p>
          <p className="text-2xl font-bold">{job.applicationCount}</p>
        </div>
        <div className="border rounded-lg p-6">
          <p className="text-sm text-gray-600 font-medium mb-2">Posted</p>
          <p className="text-2xl font-bold">
            {new Date(job.postedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Applications Table */}
      <Tabs defaultValue="all" className="border rounded-lg p-6">
        <TabsList>
          <TabsTrigger value="all">
            All ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="new">
            New (
            {applications.filter((a) => a.status === 'new').length})
          </TabsTrigger>
          <TabsTrigger value="interview">
            Interview (
            {applications.filter((a) => a.status === 'interview').length})
          </TabsTrigger>
          <TabsTrigger value="hired">
            Hired (
            {applications.filter((a) => a.status === 'hired').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Submitted</th>
                  <th className="text-right py-3 px-4 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="py-3 px-4 font-medium">{app.candidateName}</td>
                    <td className="py-3 px-4 text-gray-600">{app.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {app.rating && (
                        <span className="text-sm font-medium">{app.rating}/5</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <div className="text-center py-8 text-gray-600">
            {applications.filter((a) => a.status === 'new').length === 0
              ? 'No new applications'
              : 'Applications list filtered'}
          </div>
        </TabsContent>

        <TabsContent value="interview" className="mt-6">
          <div className="text-center py-8 text-gray-600">
            {applications.filter((a) => a.status === 'interview').length === 0
              ? 'No candidates in interview stage'
              : 'Applications list filtered'}
          </div>
        </TabsContent>

        <TabsContent value="hired" className="mt-6">
          <div className="text-center py-8 text-gray-600">
            {applications.filter((a) => a.status === 'hired').length === 0
              ? 'No hired candidates yet'
              : 'Applications list filtered'}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
