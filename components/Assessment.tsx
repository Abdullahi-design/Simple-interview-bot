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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
          <h2 className="text-3xl font-bold text-white mb-1">Interview Assessment</h2>
          <p className="text-indigo-100 text-sm">Candidate evaluation summary</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Candidate</h3>
              <p className="text-lg font-bold text-slate-900">{candidateName}</p>
              <p className="text-sm text-slate-600 mt-1">{candidateEmail}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Position</h3>
              <p className="text-lg font-bold text-slate-900">{jobTitle}</p>
            </div>
          </div>

          <div className={`inline-block px-6 py-3 rounded-xl border-2 font-bold text-lg ${getScoreColor(assessment.score || '')}`}>
            Score: {assessment.score}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Summary</h3>
            <p className="text-slate-700 leading-relaxed text-base bg-slate-50 p-4 rounded-xl border border-slate-200">{assessment.summary}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Key Insights</h3>
            <ul className="space-y-2">
              {assessment.insights.map((insight, index) => (
                <li key={index} className="flex items-start p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-indigo-600 font-bold mr-3">{index + 1}.</span>
                  <span className="text-slate-700 flex-1">{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Full Transcript</h3>
            <div className="bg-slate-50 rounded-xl p-5 max-h-96 overflow-y-auto border border-slate-200">
              {messages.map((message) => (
                <div key={message.id} className="mb-4 last:mb-0">
                  <div className="font-bold text-sm text-indigo-600 mb-1.5 uppercase tracking-wide">
                    {message.role === 'user' ? 'Candidate' : 'Interviewer'}
                  </div>
                  <div className="text-slate-800 whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200">{message.content}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 flex gap-3">
            <button
              onClick={() => {
                // Export as JSON
                const data = {
                  candidate: { name: candidateName, email: candidateEmail },
                  position: jobTitle,
                  assessment,
                  transcript: messages,
                  completedAt: new Date().toISOString(),
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `interview-${candidateName.replace(/\s+/g, '-')}-${Date.now()}.json`;
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
                text += `Candidate: ${candidateName}\n`;
                text += `Email: ${candidateEmail}\n`;
                text += `Position: ${jobTitle}\n`;
                text += `Score: ${assessment.score}\n\n`;
                text += `Summary:\n${assessment.summary}\n\n`;
                text += `Key Insights:\n`;
                assessment.insights.forEach((insight, i) => {
                  text += `${i + 1}. ${insight}\n`;
                });
                text += `\n\nFull Transcript:\n`;
                text += `================\n\n`;
                messages.forEach((msg) => {
                  text += `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}\n\n`;
                });
                
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `interview-${candidateName.replace(/\s+/g, '-')}-${Date.now()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex-1 px-5 py-3 bg-white text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 border border-slate-300 shadow-sm hover:shadow"
            >
              Export Text
            </button>
            <button
              onClick={resetInterview}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              New Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
