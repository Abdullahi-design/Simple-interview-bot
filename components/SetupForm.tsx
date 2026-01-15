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
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Interview Setup</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title / Role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g., Senior Software Engineer"
            className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Candidate Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2 text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Candidate Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full px-4 py-2 text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="useCustom"
            checked={useCustomQuestions}
            onChange={(e) => setUseCustomQuestions(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="useCustom" className="text-sm font-medium text-gray-700">
            Use custom interview questions
          </label>
        </div>

        {useCustomQuestions && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Questions
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddQuestion()}
                placeholder="Enter a question and press Enter"
                className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {customQuestions.map((q, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{q}</span>
                  <button
                    onClick={() => handleRemoveQuestion(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {customQuestions.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                No custom questions added. AI will generate questions based on the job title.
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleStartInterview}
          className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors mt-6"
        >
          Start Interview
        </button>
      </div>
    </div>
  );
}
