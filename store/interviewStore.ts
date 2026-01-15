import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface InterviewState {
  // Setup phase
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  customQuestions: string[];
  useCustomQuestions: boolean;
  
  // Interview phase
  messages: Message[];
  isInterviewActive: boolean;
  isInterviewComplete: boolean;
  
  // Assessment phase
  assessment: {
    score: 'Strong' | 'Moderate' | 'Weak' | null;
    summary: string;
    insights: string[];
  } | null;
  
  // Actions
  setJobTitle: (title: string) => void;
  setCandidateName: (name: string) => void;
  setCandidateEmail: (email: string) => void;
  setCustomQuestions: (questions: string[]) => void;
  setUseCustomQuestions: (use: boolean) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  startInterview: () => void;
  completeInterview: () => void;
  setAssessment: (assessment: InterviewState['assessment']) => void;
  resetInterview: () => void;
}

const initialState = {
  jobTitle: '',
  candidateName: '',
  candidateEmail: '',
  customQuestions: [],
  useCustomQuestions: false,
  messages: [],
  isInterviewActive: false,
  isInterviewComplete: false,
  assessment: null,
};

export const useInterviewStore = create<InterviewState>((set) => ({
  ...initialState,
  
  setJobTitle: (title) => set({ jobTitle: title }),
  setCandidateName: (name) => set({ candidateName: name }),
  setCandidateEmail: (email) => set({ candidateEmail: email }),
  setCustomQuestions: (questions) => set({ customQuestions: questions }),
  setUseCustomQuestions: (use) => set({ useCustomQuestions: use }),
  
  addMessage: (message) => set((state) => ({
    messages: [
      ...state.messages,
      {
        ...message,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      },
    ],
  })),
  
  startInterview: () => set({ isInterviewActive: true }),
  completeInterview: () => set({ isInterviewComplete: true, isInterviewActive: false }),
  setAssessment: (assessment) => set({ assessment }),
  
  resetInterview: () => set(initialState),
}));
