'use client';

import { useState, useRef, useEffect } from 'react';
import { useInterviewStore } from '@/store/interviewStore';

export default function InterviewChat() {
  const {
    messages,
    jobTitle,
    candidateName,
    customQuestions,
    useCustomQuestions,
    addMessage,
    completeInterview,
    setAssessment,
  } = useInterviewStore();
  
  const getCurrentMessages = () => useInterviewStore.getState().messages;

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage({ role: 'user', content: userMessage });
    setIsLoading(true);

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: 'user', content: userMessage },
          ],
          jobTitle,
          customQuestions,
          useCustomQuestions,
          isInitial: false,
        }),
      });

      const data = await response.json();
      if (data.response) {
        addMessage({ role: 'assistant', content: data.response });
        
        // Wait a bit for state to update, then check if interview should end
        setTimeout(async () => {
          const currentMessages = getCurrentMessages();
          const lastResponse = data.response.toLowerCase();
          
          // Check if interview should end (AI indicates completion or enough exchanges)
          if (lastResponse.includes('thank you') || 
              lastResponse.includes('conclusion') ||
              lastResponse.includes('wrap up') ||
              currentMessages.length >= 10) {
            // Generate assessment
            await generateAssessment();
          }
        }, 100);
      } else if (data.error) {
        addMessage({ 
          role: 'assistant', 
          content: 'I apologize, but I encountered an error. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({ 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAssessment = async () => {
    try {
      // Get the latest messages from store
      const currentMessages = getCurrentMessages();
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages,
          jobTitle,
        }),
      });

      const data = await response.json();
      if (data.score && data.summary) {
        setAssessment({
          score: data.score,
          summary: data.summary,
          insights: data.insights || [],
        });
        completeInterview();
      }
    } catch (error) {
      console.error('Error generating assessment:', error);
    }
  };

  const handleEndInterview = async () => {
    if (messages.length < 2) {
      alert('Please have at least one exchange before ending the interview.');
      return;
    }
    await generateAssessment();
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h2 className="text-xl font-bold text-gray-800">Interview with {candidateName}</h2>
        <p className="text-sm text-gray-600">Position: {jobTitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[500px]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type your response..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
          <button
            onClick={handleEndInterview}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            End Interview
          </button>
        </div>
      </div>
    </div>
  );
}
