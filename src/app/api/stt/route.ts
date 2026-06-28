import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OpenAI API Key' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const response = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      // Providing Hindi context can help if it's heavily mixed, 
      // but Whisper auto-detects quite well.
    });

    return NextResponse.json({ text: response.text });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('STT Error:', err);
    return NextResponse.json({ error: err.message || 'STT Failed' }, { status: 500 });
  }
}
