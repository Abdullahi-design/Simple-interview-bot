'use client';

import { useInterviewStore } from '@/store/interviewStore';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function InterviewDetailPage() {
  const params = useParams();
  const { pastInterviews } = useInterviewStore();
  const interview = pastInterviews.find((i) => i.id === params.id);

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">Interview not found</p>
            <Link
              href="/interviews"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Interviews
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/interviews"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Interviews
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Interview Details
          </h1>

          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Candidate</h3>
              <p className="text-lg text-gray-800">{interview.candidateName}</p>
              <p className="text-sm text-gray-600">{interview.candidateEmail}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Position</h3>
              <p className="text-lg text-gray-800">{interview.jobTitle}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Completed At
              </h3>
              <p className="text-sm text-gray-600">
                {formatDate(interview.completedAt)}
              </p>
            </div>
          </div>

          {interview.assessment && (
            <>
              <div
                className={`inline-block px-4 py-2 rounded-lg border-2 font-semibold mb-6 ${getScoreColor(
                  interview.assessment.score
                )}`}
              >
                Score: {interview.assessment.score}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Summary
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {interview.assessment.summary}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Key Insights
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {interview.assessment.insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Full Transcript
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              {interview.messages.map((message) => (
                <div key={message.id} className="mb-3">
                  <div className="font-semibold text-sm text-gray-600 mb-1">
                    {message.role === 'user' ? 'Candidate' : 'Interviewer'}
                  </div>
                  <div className="text-gray-800 whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                // Export as JSON
                const data = {
                  candidate: { 
                    name: interview.candidateName, 
                    email: interview.candidateEmail 
                  },
                  position: interview.jobTitle,
                  assessment: interview.assessment,
                  transcript: interview.messages,
                  completedAt: interview.completedAt.toISOString(),
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `interview-${interview.candidateName.replace(/\s+/g, '-')}-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={() => {
                // Export as text/CSV-like format
                let text = `Interview Assessment\n`;
                text += `===================\n\n`;
                text += `Candidate: ${interview.candidateName}\n`;
                text += `Email: ${interview.candidateEmail}\n`;
                text += `Position: ${interview.jobTitle}\n`;
                text += `Completed: ${formatDate(interview.completedAt)}\n`;
                if (interview.assessment) {
                  text += `Score: ${interview.assessment.score}\n\n`;
                  text += `Summary:\n${interview.assessment.summary}\n\n`;
                  text += `Key Insights:\n`;
                  interview.assessment.insights.forEach((insight, i) => {
                    text += `${i + 1}. ${insight}\n`;
                  });
                }
                text += `\n\nFull Transcript:\n`;
                text += `================\n\n`;
                interview.messages.forEach((msg) => {
                  text += `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}\n\n`;
                });
                
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `interview-${interview.candidateName.replace(/\s+/g, '-')}-${Date.now()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
            >
              Export Text
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
