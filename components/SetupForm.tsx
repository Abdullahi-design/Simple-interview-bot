'use client';

import { useState } from 'react';
import { useInterviewStore } from '@/store/interviewStore';

export default function SetupForm() {
  const {
    jobTitle,
    candidateName,
    candidateEmail,
    customQuestions,
    useCustomQuestions,
    setJobTitle,
    setCandidateName,
    setCandidateEmail,
    setCustomQuestions,
    setUseCustomQuestions,
    startInterview,
    addMessage,
  } = useInterviewStore();

  const [questionInput, setQuestionInput] = useState('');

  const handleStartInterview = async () => {
    if (!jobTitle || !candidateName || !candidateEmail) {
      alert('Please fill in all required fields');
      return;
    }

    startInterview();

    // Send initial message to start the interview
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          jobTitle,
          customQuestions,
          useCustomQuestions,
          isInitial: true,
        }),
      });

      const data = await response.json();
      if (data.response) {
        addMessage({ role: 'assistant', content: data.response });
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please try again.');
    }
  };

  const handleAddQuestion = () => {
    if (questionInput.trim()) {
      setCustomQuestions([...customQuestions, questionInput.trim()]);
      setQuestionInput('');
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">Interview Setup</h2>
          <p className="text-indigo-100 text-sm mt-1">Configure your screening interview</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2.5">
              Job Title / Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-4 py-3 border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2.5">
                Candidate Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2.5">
                Candidate Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              id="useCustom"
              checked={useCustomQuestions}
              onChange={(e) => setUseCustomQuestions(e.target.checked)}
              className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <label htmlFor="useCustom" className="text-sm font-medium text-slate-700 cursor-pointer">
              Use custom interview questions
            </label>
          </div>

          {useCustomQuestions && (
            <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Custom Questions
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddQuestion()}
                  placeholder="Enter a question and press Enter"
                  className="flex-1 px-4 py-2.5 text-black border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm"
                />
                <button
                  onClick={handleAddQuestion}
                  className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all duration-200 font-medium shadow-sm"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {customQuestions.map((q, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-sm text-slate-700 flex-1">{q}</span>
                    <button
                      onClick={() => handleRemoveQuestion(index)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium ml-3"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              {customQuestions.length === 0 && (
                <p className="text-sm text-slate-500 mt-3 italic">
                  No custom questions added. AI will generate questions based on the job title.
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleStartInterview}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Interview
          </button>
        </div>
      </div>
    </div>
  );
}
