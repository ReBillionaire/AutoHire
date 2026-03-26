'use client';

import { useParams } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function AssessCompletePage() {
  const params = useParams();
  const token = params.token as string;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full p-10 bg-white dark:bg-slate-900 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Assessment Submitted!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Thank you for completing the assessment. Your responses have been recorded
            and our team will review them shortly.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">What happens next?</h3>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 text-left">
            <div className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-bold flex-shrink-0">1</span>
              <p>Our team will review your assessment responses</p>
            </div>
            <div className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-bold flex-shrink-0">2</span>
              <p>You will receive an email with the next steps</p>
            </div>
            <div className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-bold flex-shrink-0">3</span>
              <p>If selected, we will schedule an interview with you</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-500">
          You can safely close this page. If you have any questions, please contact the hiring team.
        </p>
      </Card>
    </div>
  );
}
