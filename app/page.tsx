'use client';

import { useInterviewStore } from '@/store/interviewStore';
import SetupForm from '@/components/SetupForm';
import InterviewChat from '@/components/InterviewChat';
import Assessment from '@/components/Assessment';
import Link from 'next/link';

export default function Home() {
  const { isInterviewActive, isInterviewComplete } = useInterviewStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                AI-Powered Interview Screening Tool
              </h1>
              <p className="text-gray-600">
                Conduct automated preliminary interviews with candidates
              </p>
            </div>
            <Link
              href="/interviews"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
            >
              View Past Interviews
            </Link>
          </div>
        </header>

        <main>
          {!isInterviewActive && !isInterviewComplete && <SetupForm />}
          {isInterviewActive && !isInterviewComplete && (
            <div className="max-w-4xl mx-auto">
              <InterviewChat />
            </div>
          )}
          {isInterviewComplete && <Assessment />}
        </main>
      </div>
    </div>
  );
}
