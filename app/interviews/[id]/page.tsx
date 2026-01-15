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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/interviews"
          className="text-indigo-600 hover:text-indigo-800 mb-6 inline-flex items-center gap-2 font-semibold transition-colors"
        >
          ← Back to Interviews
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-1">
              Interview Details
            </h1>
            <p className="text-indigo-100 text-sm">Complete interview assessment</p>
          </div>
          
          <div className="p-8">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Candidate</h3>
                <p className="text-lg font-bold text-slate-900">{interview.candidateName}</p>
                <p className="text-sm text-slate-600 mt-1">{interview.candidateEmail}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Position</h3>
                <p className="text-lg font-bold text-slate-900">{interview.jobTitle}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Completed At
                </h3>
                <p className="text-sm font-medium text-slate-700">
                  {formatDate(interview.completedAt)}
                </p>
              </div>
            </div>

            {interview.assessment && (
              <>
                <div
                  className={`inline-block px-6 py-3 rounded-xl border-2 font-bold text-lg mb-8 ${getScoreColor(
                    interview.assessment.score
                  )}`}
                >
                  Score: {interview.assessment.score}
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    Summary
                  </h3>
                  <p className="text-slate-700 leading-relaxed text-base bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {interview.assessment.summary}
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    Key Insights
                  </h3>
                  <ul className="space-y-2">
                    {interview.assessment.insights.map((insight, index) => (
                      <li key={index} className="flex items-start p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-indigo-600 font-bold mr-3">{index + 1}.</span>
                        <span className="text-slate-700 flex-1">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Full Transcript
              </h3>
              <div className="bg-slate-50 rounded-xl p-5 max-h-96 overflow-y-auto border border-slate-200">
                {interview.messages.map((message) => (
                  <div key={message.id} className="mb-4 last:mb-0">
                    <div className="font-bold text-sm text-indigo-600 mb-1.5 uppercase tracking-wide">
                      {message.role === 'user' ? 'Candidate' : 'Interviewer'}
                    </div>
                    <div className="text-slate-800 whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200">
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex gap-3">
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
                className="flex-1 px-5 py-3 bg-white text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 border border-slate-300 shadow-sm hover:shadow"
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
                className="flex-1 px-5 py-3 bg-white text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 border border-slate-300 shadow-sm hover:shadow"
              >
                Export Text
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
