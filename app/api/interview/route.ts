import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, jobTitle, customQuestions, useCustomQuestions, isInitial } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Build system prompt
    let systemPrompt = `You are a professional AI interviewer conducting a preliminary screening interview for a ${jobTitle} position. 
Your role is to:
1. Ask relevant, professional screening questions (3-5 questions total)
2. Ask follow-up questions when appropriate to get more details
3. Maintain a professional yet conversational and friendly tone
4. Keep questions concise and focused
5. When you've asked enough questions (3-5), provide a brief closing statement

${useCustomQuestions && customQuestions.length > 0 
  ? `Use these custom questions as a guide: ${customQuestions.join(', ')}` 
  : `Generate questions relevant to the ${jobTitle} role, focusing on technical skills, experience, and cultural fit.`}

Important: Keep your responses concise. Ask one question at a time.`;

    if (isInitial) {
      systemPrompt += `\n\nStart by greeting the candidate warmly and asking your first question.`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((msg: { role: string; content: string }) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I encountered an error.';

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}
