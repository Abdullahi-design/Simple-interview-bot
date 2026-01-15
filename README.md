# AI-Powered Interview Screening Tool

An AI-powered interview screening tool that enables recruiters to conduct automated preliminary interviews with candidates, reducing manual screening time while maintaining quality assessment standards.

## Features

### Core Features

- **Interview Setup Interface**
  - Input job title/role being hired for
  - Accept candidate name and email
  - Option to customize interview questions or use AI-generated questions based on the role

- **AI Interview Experience**
  - Text-based conversational interface where candidates interact with an AI interviewer
  - AI asks relevant screening questions (3-5 questions minimum)
  - Questions are contextual to the job role specified
  - AI can ask follow-up questions based on candidate responses
  - Professional yet conversational tone throughout

- **Assessment & Output**
  - AI-powered assessment/summary of the candidate after the interview
  - Score/rating based on responses (Strong/Moderate/Weak)
  - Key insights or highlights from the conversation
  - Full transcript of the interview for recruiter review

## Technologies Used

- **Next.js 15** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **OpenAI API** - AI-powered interview and assessment generation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hire-overseases-test
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
OPENAI_API_KEY=your-openai-api-key-here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Setup Phase**: 
   - Enter the job title/role
   - Enter candidate name and email
   - (Optional) Add custom interview questions or let AI generate them
   - Click "Start Interview"

2. **Interview Phase**:
   - The AI interviewer will greet the candidate and ask questions
   - Candidate responds to each question
   - AI may ask follow-up questions based on responses
   - Click "End Interview" when ready to complete

3. **Assessment Phase**:
   - View the AI-generated assessment with score, summary, and insights
   - Review the full interview transcript
   - Click "Start New Interview" to conduct another interview

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── interview/route.ts    # API route for interview conversation
│   │   └── assess/route.ts       # API route for assessment generation
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main page
├── components/
│   ├── SetupForm.tsx              # Interview setup form
│   ├── InterviewChat.tsx          # Chat interface for interview
│   └── Assessment.tsx             # Assessment results display
├── store/
│   └── interviewStore.ts         # Zustand store for state management
└── README.md
```

## Design Decisions

1. **State Management**: Used Zustand for lightweight, simple state management without the overhead of Redux
2. **API Routes**: Next.js API routes for server-side OpenAI API calls to keep API keys secure
3. **Model Choice**: Using `gpt-4o-mini` for cost-effectiveness while maintaining quality
4. **UI/UX**: Clean, modern interface with Tailwind CSS for rapid development and responsive design
5. **Auto-completion**: Interview can auto-complete when AI detects natural conclusion, or manually ended by user

## Deployment

This application can be deployed on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- Any platform supporting Next.js

Make sure to set the `OPENAI_API_KEY` environment variable in your deployment platform.

## Notes

- The application uses OpenAI's API, so you'll need an active OpenAI API key
- API keys should never be committed to the repository
- The interview flow is designed to be flexible - recruiters can end interviews at any time
- Assessment is generated automatically when the interview ends

## License

This project is created for a take-home assignment.
