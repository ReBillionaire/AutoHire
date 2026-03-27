'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Mail, Clock, FileText, Video, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ApplicationSuccessPage({
  params,
}: {
  params: { orgSlug: string; jobSlug: string };
}) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Success Checkmark */}
        <div className="mb-8 flex justify-center">
          <div
            className={`relative transition-all duration-700 ${
              animated ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
          >
            <div className="absolute inset-0 animate-pulse bg-green-400 rounded-full blur-2xl opacity-30" />
            <CheckCircle className="w-24 h-24 text-green-600 relative z-10" />
          </div>
        </div>

        {/* Main Message */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Application Submitted!
          </h1>
          <p className="text-lg text-muted-foreground">
            Thank you for applying. We've received your application and will review it carefully.
          </p>
        </div>

        {/* Timeline */}
        <div className="bg-white border border-border rounded-xl p-8 mb-8 shadow-elevation-1">
          <h2 className="font-bold text-lg text-foreground mb-6">What's Next?</h2>

          <div className="space-y-5">
            {/* Step 1: Received */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  ✓
                </div>
                <div className="w-0.5 h-12 bg-green-200 mt-2" />
              </div>
              <div className="pt-1 pb-4">
                <p className="font-bold text-foreground">Application Received</p>
                <p className="text-sm text-muted-foreground">Your application has been submitted successfully</p>
              </div>
            </div>

            {/* Step 2: Review */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="w-0.5 h-12 bg-gray-200 mt-2" />
              </div>
              <div className="pt-1 pb-4">
                <p className="font-bold text-foreground">Initial Review</p>
                <p className="text-sm text-muted-foreground">Our team will review your resume and video (within 2-3 days)</p>
              </div>
            </div>

            {/* Step 3: Interview */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div className="w-0.5 h-12 bg-gray-200 mt-2" />
              </div>
              <div className="pt-1 pb-4">
                <p className="font-bold text-foreground">Interview Invitation</p>
                <p className="text-sm text-muted-foreground">If selected, we'll reach out to schedule an interview</p>
              </div>
            </div>

            {/* Step 4: Decision */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
              <div className="pt-1">
                <p className="font-bold text-foreground">Final Decision</p>
                <p className="text-sm text-muted-foreground">We'll provide feedback and next steps</p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Notification */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-900 mb-1">Check Your Email</p>
              <p className="text-sm text-blue-800">
                We'll send you updates about your application. Please check your inbox and spam folder.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <Link href={`/careers/${params.orgSlug}`}>
            <Button className="w-full" size="lg">
              Back to Job Listings
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <Link href={`/careers/${params.orgSlug}/${params.jobSlug}`}>
            <Button variant="outline" className="w-full" size="lg">
              View This Job
            </Button>
          </Link>
        </div>

        {/* Footer Message */}
        <p className="text-center text-xs text-muted-foreground">
          If you have any questions, feel free to reach out to the hiring team.
          <br />
          You can withdraw your application at any time.
        </p>
      </div>
    </div>
  );
}
