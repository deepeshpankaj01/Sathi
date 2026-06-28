import { NextResponse } from 'next/server';
import { detectCrisis, CRISIS_RESPONSE } from '@/services/moderationService';
import { generateAnthropicStream } from '@/services/anthropicService';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.string(),
      content: z.string(),
    })
  ),
  companionId: z.enum(['male', 'female']).default('male'),
  mode: z.enum(['general', 'student', 'business', 'job']).default('general'),
  conversationId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Missing Anthropic API Key' }, { status: 500 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const parsed = chatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const { messages, companionId, mode, conversationId } = parsed.data;
    
    // 1. Save User Message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user' && user && conversationId) {
      await supabase.from('messages').insert({
        id: uuidv4(),
        conversation_id: conversationId,
        role: 'user',
        content: lastMessage.content
      });
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
    }

    // 1.5 Fetch Profile Memory
    let profileStr = '';
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (profile) {
        profileStr = `User Profile Memory: Name: ${profile.name || 'Unknown'}, Age: ${profile.age || 'Unknown'}. Struggles/Bio: ${profile.bio || 'None specified'}.`;
      }
    }

    // 2. Moderation Check (Pre-LLM)
    if (lastMessage && lastMessage.role === 'user') {
      const isCrisis = detectCrisis(lastMessage.content);
      if (isCrisis) {
        if (user && conversationId) {
          await supabase.from('messages').insert({
            id: uuidv4(),
            conversation_id: conversationId,
            role: 'assistant',
            content: CRISIS_RESPONSE
          });
        }
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(CRISIS_RESPONSE));
            controller.close();
          }
        });
        return new Response(stream, { headers: { 'Content-Type': 'text/plain' } });
      }
    }

    // 3. Generate and Stream
    const stream = await generateAnthropicStream(
      messages, 
      companionId, 
      mode, 
      profileStr,
      async (completion: string) => {
        // onFinish callback
        if (user && conversationId) {
          const s = createClient(); // re-init client if needed or rely on completion scope
          await s.from('messages').insert({
            id: uuidv4(),
            conversation_id: conversationId,
            role: 'assistant',
            content: completion
          });
        }
      }
    );

    return stream;

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Chat Error:', err);
    return NextResponse.json({ error: err.message || 'Chat Failed' }, { status: 500 });
  }
}
