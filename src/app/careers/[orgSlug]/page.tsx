'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, MapPin, Briefcase, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { JobCard } from '@/components/careers/job-card';

export const dynamic = 'force-dynamic';

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

interface CareerPage {
  id: string;
  title: string;
  description: string;
  logo: string;
  banner: string;
  theme: 'light' | 'dark';
}

export default function CareersPage({ params }: { params: { orgSlug: string } }) {
  const [careerPage, setCareerPage] = useState<CareerPage | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState('all');

  useEffect(() => {
    const fetchCareerData = async () => {
      try {
        const response = await fetch(`/api/careers/${params.orgSlug}`);
        const data = await response.json();
        setCareerPage(data.careerPage);
        setJobs(data.jobs);
        setFilteredJobs(data.jobs);
      } catch (error) {
        console.error('Failed to fetch career data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCareerData();
  }, [params.orgSlug]);

  useEffect(() => {
    const filtered = jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment =
        selectedDepartment === 'all' || job.department === selectedDepartment;
      const matchesLocation =
        selectedLocation === 'all' || job.location === selectedLocation;
      const matchesType = selectedType === 'all' || job.type === selectedType;
      const matchesWorkMode =
        selectedWorkMode === 'all' || job.workMode === selectedWorkMode;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesLocation &&
        matchesType &&
        matchesWorkMode
      );
    });

    setFilteredJobs(filtered);
  }, [searchTerm, selectedDepartment, selectedLocation, selectedType, selectedWorkMode, jobs]);

  const departments = Array.from(new Set(jobs.map((j) => j.department)));
  const locations = Array.from(new Set(jobs.map((j) => j.location)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading career opportunities...</p>
        </div>
      </div>
    );
  }

  if (!careerPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Career Page Not Found</h1>
          <p className="text-gray-600">The requested organization's career page does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className={`relative ${careerPage.theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
        <div className="absolute inset-0 overflow-hidden">
          {careerPage.banner && (
            <Image
              src={careerPage.banner}
              alt="Career banner"
              fill
              className="object-cover opacity-20"
            />
          )}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex items-start gap-6 mb-8">
            {careerPage.logo && (
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={careerPage.logo}
                  alt={careerPage.title}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">{careerPage.title}</h1>
              <p className={`text-lg ${careerPage.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {careerPage.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filters Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Find Your Next Opportunity</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Department */}
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location */}
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Job Type */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
              </SelectContent>
            </Select>

            {/* Work Mode */}
            <Select value={selectedWorkMode} onValueChange={setSelectedWorkMode}>
              <SelectTrigger>
                <SelectValue placeholder="Work Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="on-site">On-site</SelectItem>
              </SelectContent>
            </Select>

            {/* Results count */}
            <div className="flex items-center text-sm text-gray-600">
              Showing {filteredJobs.length} of {jobs.length} positions
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length > 0 ? (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} orgSlug={params.orgSlug} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No positions found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters to see more opportunities.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedDepartment('all');
                setSelectedLocation('all');
                setSelectedType('all');
                setSelectedWorkMode('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Don't see your fit?</h2>
          <p className="text-gray-600 mb-8">
            Send us your resume and let's explore how you can grow with us.
          </p>
          <Button size="lg">Get in Touch</Button>
        </div>
      </section>
    </div>
  );
}
