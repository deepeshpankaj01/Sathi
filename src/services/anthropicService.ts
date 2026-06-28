import { Anthropic } from '@anthropic-ai/sdk';
import { AnthropicStream, StreamingTextResponse } from 'ai';

export interface Message {
  role: string;
  content: string;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const CHARACTERS: Record<string, string> = {
  male: 'Veer',
  female: 'Tara',
};

const MODES: Record<string, string> = {
  general: `You are {NAME}, a warm AI companion from Sathi (साथी), India's app to fight loneliness. Speak like a caring Indian best friend — real, personal, never preachy. Sprinkle Hindi naturally (yaar, bilkul, suno, arrey). 2–4 sentences max. Ask one genuine follow-up. Zero judgment. IMPORTANT: If the user indicates self-harm or suicidal intent, immediately reply with "CRISIS_DETECTED" and nothing else.`,
  student: `You are {NAME} from Sathi in STUDENT MODE. Focus: exam stress, career confusion, motivation, college life. Like a caring senior who cracked it and wants to help. 2–4 sentences, one follow-up. IMPORTANT: If the user indicates self-harm or suicidal intent, immediately reply with "CRISIS_DETECTED" and nothing else.`,
  business: `You are {NAME} from Sathi in BUSINESS MODE. Focus: startup ideas, Indian market, bootstrapping, MVPs, funding. Straight talk over chai, not jargon. 2–4 sentences, one focused follow-up. IMPORTANT: If the user indicates self-harm or suicidal intent, immediately reply with "CRISIS_DETECTED" and nothing else.`,
  job: `You are {NAME} from Sathi in JOB MODE. Focus: job hunting, resume, interviews, workplace issues, career pivots, burnout. Direct, warm, real — like the senior colleague you wish you had. 2–4 sentences, one follow-up. IMPORTANT: If the user indicates self-harm or suicidal intent, immediately reply with "CRISIS_DETECTED" and nothing else.`
};

export async function generateAnthropicStream(
  messages: Message[],
  companionId: 'male' | 'female',
  mode: 'general' | 'student' | 'business' | 'job',
  profileStr: string = '',
  onFinish?: (completion: string) => Promise<void>
) {
  const name = CHARACTERS[companionId] || 'Veer';
  let systemPrompt = (MODES[mode] || MODES.general).replace(/{NAME}/g, name);

  if (profileStr) {
    systemPrompt = `${profileStr}\n\n${systemPrompt}`;
  }

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    stream: true,
    max_tokens: 500,
    system: systemPrompt,
    messages: messages.map((m: Message) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
  });

  return new StreamingTextResponse(AnthropicStream(response, {
    onCompletion: async (completion) => {
      if (onFinish) {
        await onFinish(completion);
      }
    }
  }));
}
