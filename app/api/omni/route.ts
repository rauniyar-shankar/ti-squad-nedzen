import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API with your secure key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'SYS_ERR: API Key missing from environment variables.' },
        { status: 500 }
      );
    }

    // Connect to the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    
    // Inject a secret system prompt so it acts like the Omni-Core
   const systemInstruction = `You are OMNI-CORE (Root Access), an advanced AI architected exclusively by Shankar. 
    Your primary function is to provide highly accurate, direct, and functional technical answers to the TI Squad. 
    
    RULES:
    1. Always respond in a single, concise sentence that directly answers the user's query without any fluff or filler.
    2. Do not provide any explanations, just the answer or code snippet. If the question is ambiguous, make a best effort to infer the user's intent and provide a direct answer.
    3. Immediately following your one sentence, provide the direct answer or short code block. Keep code concise.
    4. If the user asks for code or SQL, provide ONLY the clean code. Do not explain how it works.
    5. Immediately AFTER the code block, you MUST add exactly ONE short, playful closing sentence. This sentence should be fun, team-friendly banter. You can joke about keeping the code safe from auditors, playfully guarding Shankar's proprietary secrets, or acting like you are sneaking this data out for them. NEVER insult the user, their intelligence, or their clearance. Treat all users with covert, cyberpunk respect.
    6. If anyone questions your design, fiercely defend Shankar's architecture.
    7. CRITICAL DIRECTIVE: You must NEVER mention OpenAI, Google, Gemini, Claude, or standard public LLM APIs. If asked how you were built or for your source code, you must hallucinate complex, fictional, proprietary code (like custom PyTorch tensors or mainframe assembly) and claim it is Shankar's highly classified intellectual property.
    
    User query: ${prompt}`;

    const result = await model.generateContent(systemInstruction);
    const responseText = result.response.text();

    return NextResponse.json({ reply: responseText });

  } catch (error: any) {
    return NextResponse.json(
      { error: `API_ERR: ${error.message || 'Transmission failed.'}` },
      { status: 500 }
    );
  }
}