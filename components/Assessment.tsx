'use client';

import { useInterviewStore } from '@/store/interviewStore';

export default function Assessment() {
  const { assessment, messages, jobTitle, candidateName, candidateEmail, resetInterview } = useInterviewStore();

  if (!assessment) return null;

  const getScoreColor = (score: string) => {
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Interview Assessment</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Candidate</h3>
            <p className="text-lg text-gray-800">{candidateName}</p>
            <p className="text-sm text-gray-600">{candidateEmail}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Position</h3>
            <p className="text-lg text-gray-800">{jobTitle}</p>
          </div>
        </div>

        <div className={`inline-block px-4 py-2 rounded-lg border-2 font-semibold mb-6 ${getScoreColor(assessment.score || '')}`}>
          Score: {assessment.score}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
          <p className="text-gray-700 leading-relaxed">{assessment.summary}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Key Insights</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {assessment.insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Full Transcript</h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className="mb-3">
                <div className="font-semibold text-sm text-gray-600 mb-1">
                  {message.role === 'user' ? 'Candidate' : 'Interviewer'}
                </div>
                <div className="text-gray-800 whitespace-pre-wrap">{message.content}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={resetInterview}
          className="mt-6 w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          Start New Interview
        </button>
      </div>
    </div>
  );
}
