'use client';

import { useInterviewStore } from '@/store/interviewStore';
import SetupForm from '@/components/SetupForm';
import InterviewChat from '@/components/InterviewChat';
import Assessment from '@/components/Assessment';
import Link from 'next/link';

export default function Home() {
  const { isInterviewActive, isInterviewComplete } = useInterviewStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex justify-between items-start mb-6">
            <div className="w-32"></div>
            <div className="flex-1">
              <div className="inline-block mb-3">
                <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full">
                  AI-Powered
                </span>
              </div>
              <h1 className="text-5xl font-bold text-slate-900 mb-3 tracking-tight">
                Interview Screening
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Conduct automated preliminary interviews with candidates using advanced AI technology
              </p>
            </div>
            <Link
              href="/interviews"
              className="px-5 py-2.5 bg-white text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow border border-slate-200"
            >
              Past Interviews
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
