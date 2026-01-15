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
    saveInterview,
  } = useInterviewStore();
  
  const getCurrentMessages = () => useInterviewStore.getState().messages;

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startRecording = async () => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        if (audioChunksRef.current.length === 0) {
          setIsRecording(false);
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        setIsRecording(false);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error: any) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Microphone permission denied. Please allow microphone access and try again.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        alert('No microphone found. Please check your microphone connection.');
      } else {
        alert('Error accessing microphone. Please try typing your response instead.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Transcription error:', errorData);
        alert('Failed to transcribe audio. Please try typing your response.');
        setIsTranscribing(false);
        return;
      }

      const data = await response.json();
      if (data.text && data.text.trim()) {
        setInput(data.text.trim());
        // Auto-send the transcribed text
        setTimeout(() => {
          handleSend(data.text.trim());
        }, 100);
      } else {
        alert('No speech detected. Please try again.');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Failed to transcribe audio. Please try typing your response.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const playTextToSpeech = async (text: string) => {
    if (isPlaying) return; // Don't play if already playing
    if (!text || text.trim().length === 0) return; // Don't play empty text
    if (text.length > 5000) {
      console.warn('Text too long for TTS, skipping audio');
      return; // Skip very long text to avoid API limits
    }

    try {
      setIsPlaying(true);
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate speech';
        const contentType = response.headers.get('content-type');
        
        try {
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
            console.error('TTS API error:', errorData);
          } else {
            const errorText = await response.text();
            errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
            console.error('TTS API error - non-JSON response:', response.status, response.statusText, errorText);
          }
        } catch (e) {
          console.error('TTS API error - failed to parse response:', response.status, response.statusText, e);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        console.error('TTS failed:', errorMessage);
        setIsPlaying(false);
        // Silently fail - user can still read the text
        return;
      }

      // Check if response is actually audio
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('audio')) {
        console.error('TTS response is not audio:', contentType);
        setIsPlaying(false);
        return;
      }

      // Create blob from audio stream
      const audioBlob = await response.blob();
      
      // Verify blob is not empty
      if (audioBlob.size === 0) {
        console.error('TTS returned empty audio blob');
        setIsPlaying(false);
        return;
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl); // Clean up
      };

      audio.onerror = (e) => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl); // Clean up
        console.error('Error playing audio:', e);
      };

      await audio.play().catch((error) => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      });
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsPlaying(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || input.trim()).trim();
    if (!messageText || isLoading) return;

    setInput('');
    addMessage({ role: 'user', content: messageText });
    setIsLoading(true);

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: 'user', content: messageText },
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
        
        // Play the AI response as speech
        await playTextToSpeech(data.response);
        
        // Wait a bit for state to update, then check if interview should end
        setTimeout(async () => {
          const currentMessages = getCurrentMessages();
          const lastResponse = data.response.toLowerCase();
          
          // Check if interview should end (AI indicates completion or enough exchanges)
          // Look for closing phrases that indicate the interview is ending
          const closingPhrases = [
            'thank you for taking the time',
            'thank you for your time',
            'you\'ll hear from us',
            'hear from us if',
            'selected for the next stage',
            'appreciate your interest',
            'conclusion',
            'wrap up'
          ];
          
          const isClosing = closingPhrases.some(phrase => lastResponse.includes(phrase));
          
          if (isClosing || currentMessages.length >= 12) {
            // Small delay to ensure closing message is fully displayed
            setTimeout(async () => {
              await generateAssessment();
            }, 500);
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
        // Save interview to localStorage
        saveInterview();
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
    if (isRecording) {
      stopRecording();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Add closing message before generating assessment
    const closingMessage = "Thank you for taking the time to speak with me today. We appreciate your interest in this position. You'll hear from us if you've been selected for the next stage. Have a great day!";
    addMessage({ role: 'assistant', content: closingMessage });
    
    // Play the closing message
    await playTextToSpeech(closingMessage);
    
    // Wait a moment for the message to be displayed and played
    setTimeout(async () => {
      await generateAssessment();
      // Note: saveInterview is called in generateAssessment
    }, 2000);
  };

  // Play initial greeting when interview starts
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant' && !isLoading) {
      // Small delay to ensure component is fully mounted
      setTimeout(() => {
        playTextToSpeech(messages[0].content);
      }, 500);
    }
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h2 className="text-xl font-bold text-gray-800">Voice Interview with {candidateName}</h2>
        <p className="text-sm text-gray-600">Position: {jobTitle}</p>
        <p className="text-xs text-gray-500 mt-1">
          💬 Speak your responses or type them below
        </p>
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
              {message.role === 'assistant' && (
                <button
                  onClick={() => playTextToSpeech(message.content)}
                  disabled={isPlaying}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  title="Replay audio"
                >
                  🔊 Replay
                </button>
              )}
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

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2 mb-2">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading || isPlaying || isTranscribing}
            className={`px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isRecording ? (
              <>
                <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                Stop Recording
              </>
            ) : (
              <>
                🎤 Speak
              </>
            )}
          </button>
          {isRecording && (
            <div className="flex items-center text-red-600 text-sm">
              <span className="animate-pulse">Recording...</span>
            </div>
          )}
          {isTranscribing && (
            <div className="flex items-center text-blue-600 text-sm">
              <span className="animate-pulse">Transcribing...</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Or type your response here..."
            className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading || isRecording || isTranscribing}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim() || isRecording || isTranscribing}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
          <button
            onClick={handleEndInterview}
            disabled={isLoading || isRecording || isTranscribing}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            End Interview
          </button>
        </div>
      </div>
    </div>
  );
}
