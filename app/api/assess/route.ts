import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, jobTitle } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const conversation = messages
      .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
      .join('\n');

    const systemPrompt = `You are an expert recruiter analyzing an interview transcript for a ${jobTitle} position.

Analyze the conversation and provide:
1. A score: "Strong", "Moderate", or "Weak" based on the candidate's responses
2. A brief summary (2-3 sentences) of the candidate's performance
3. 3-5 key insights or highlights from the interview

Format your response as JSON:
{
  "score": "Strong" | "Moderate" | "Weak",
  "summary": "brief summary here",
  "insights": ["insight 1", "insight 2", "insight 3"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Interview transcript:\n\n${conversation}\n\nProvide your assessment in the JSON format specified.`,
        },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content || '{}';
    const assessment = JSON.parse(response);

    return NextResponse.json(assessment);
  } catch (error: any) {
    console.error('Assessment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate assessment' },
      { status: 500 }
    );
  }
}
