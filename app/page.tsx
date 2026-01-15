'use client';

import { useInterviewStore } from '@/store/interviewStore';
import SetupForm from '@/components/SetupForm';
import InterviewChat from '@/components/InterviewChat';
import Assessment from '@/components/Assessment';

export default function Home() {
  const { isInterviewActive, isInterviewComplete } = useInterviewStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI-Powered Interview Screening Tool
          </h1>
          <p className="text-gray-600">
            Conduct automated preliminary interviews with candidates
          </p>
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
