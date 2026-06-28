import { NextResponse } from 'next/server';

const VOICE_IDS = {
  male: 'pNInz6obbfDQGcgMyIGC', // Adam (example realistic male voice, can be tuned)
  female: 'EXAVITQu4vr4xnSDxMaL', // Bella (example realistic female voice, can be tuned)
};

export async function POST(req: Request) {
  try {
    const { text, companionId } = await req.json();
    
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: 'Missing ElevenLabs API Key' }, { status: 500 });
    }

    const voiceId = VOICE_IDS[companionId as keyof typeof VOICE_IDS] || VOICE_IDS.male;

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2', // Best for Hindi/English mix
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API Error:', errorText);
      return NextResponse.json({ error: 'TTS Generation Failed' }, { status: response.status });
    }

    // Stream the audio back
    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
      }
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('TTS Error:', err);
    return NextResponse.json({ error: err.message || 'TTS Failed' }, { status: 500 });
  }
}
