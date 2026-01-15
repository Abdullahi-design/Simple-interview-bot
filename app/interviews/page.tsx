'use client';

import { useInterviewStore } from '@/store/interviewStore';
import Link from 'next/link';

export default function InterviewsPage() {
  const { pastInterviews, deleteInterview } = useInterviewStore();

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  const getScoreColor = (score: string | null) => {
    switch (score) {
      case 'Strong':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Weak':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Past Interviews
            </h1>
            <p className="text-gray-600">
              View and manage all completed interviews
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            New Interview
          </Link>
        </div>

        {pastInterviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No interviews yet</p>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Start your first interview →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pastInterviews.map((interview) => (
              <div
                key={interview.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {interview.candidateName}
                    </h3>
                    <p className="text-sm text-gray-600">{interview.jobTitle}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(interview.completedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this interview?')) {
                        deleteInterview(interview.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                    title="Delete interview"
                  >
                    🗑️
                  </button>
                </div>

                {interview.assessment && (
                  <div className="mb-4">
                    <div
                      className={`inline-block px-3 py-1 rounded-lg border-2 font-semibold text-sm mb-2 ${getScoreColor(
                        interview.assessment.score
                      )}`}
                    >
                      {interview.assessment.score}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {interview.assessment.summary}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <span>{interview.messages.length} messages</span>
                  <span>{interview.candidateEmail}</span>
                </div>

                <Link
                  href={`/interviews/${interview.id}`}
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
