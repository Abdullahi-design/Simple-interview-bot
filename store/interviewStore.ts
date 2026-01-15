import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Interview {
  id: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  customQuestions: string[];
  messages: Message[];
  assessment: {
    score: 'Strong' | 'Moderate' | 'Weak' | null;
    summary: string;
    insights: string[];
  } | null;
  completedAt: Date;
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
  
  // Past interviews
  pastInterviews: Interview[];
  
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
  saveInterview: () => void;
  resetInterview: () => void;
  deleteInterview: (id: string) => void;
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
  pastInterviews: [],
};

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set) => ({
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
      
      saveInterview: () => set((state) => {
        if (!state.isInterviewComplete || !state.assessment) return state;
        
        const interview: Interview = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          jobTitle: state.jobTitle,
          candidateName: state.candidateName,
          candidateEmail: state.candidateEmail,
          customQuestions: state.customQuestions,
          messages: state.messages,
          assessment: state.assessment,
          completedAt: new Date(),
        };
        
        return {
          pastInterviews: [interview, ...state.pastInterviews],
        };
      }),
      
      resetInterview: () => set(initialState),
      
      deleteInterview: (id) => set((state) => ({
        pastInterviews: state.pastInterviews.filter(interview => interview.id !== id),
      })),
    }),
    {
      name: 'interview-storage',
      partialize: (state) => ({ pastInterviews: state.pastInterviews }),
    }
  )
);
