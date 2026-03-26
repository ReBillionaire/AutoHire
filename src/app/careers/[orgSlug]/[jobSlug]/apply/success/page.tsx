'use client';

import { useParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function ApplySuccessPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full p-10 bg-white dark:bg-slate-900 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Application Submitted!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Thank you for your interest! Your application has been received and
            our hiring team will review it shortly.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">What to expect:</h3>
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <div className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 text-xs font-bold flex-shrink-0">1</span>
              <p>You will receive a confirmation email shortly</p>
            </div>
            <div className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 text-xs font-bold flex-shrink-0">2</span>
              <p>Our team will review your application within 5-7 business days</p>
            </div>
            <div className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 text-xs font-bold flex-shrink-0">3</span>
              <p>If shortlisted, you will be contacted for the next steps</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`/careers/${orgSlug}`} className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <ArrowRight className="w-4 h-4" />
              View More Positions
            </Button>
          </Link>
        </div>

        <p className="text-xs text-slate-500 mt-6">
          You can safely close this page. Good luck with your application!
        </p>
      </Card>
    </div>
  );
}
