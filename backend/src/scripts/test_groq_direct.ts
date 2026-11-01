import dotenv from 'dotenv';
dotenv.config();

import { GroqProvider } from '../services/ai/groq.provider';
import { CHAT_TOOLS_DEFINITIONS } from '../modules/chat/chat.tools';
import { buildChatSystemPrompt } from '../modules/chat/chat.prompt';

async function testGroqDirect() {
  console.log('Testing GroqProvider directly...');
  const provider = new GroqProvider();
  const systemPrompt = buildChatSystemPrompt();
  
  try {
    const res = await provider.generateChatResponse(
      [{ role: 'user', content: 'What are the best places near Rishikesh?' }],
      CHAT_TOOLS_DEFINITIONS,
      systemPrompt
    );
    console.log('Groq response success:');
    console.log('Provider:', res.provider);
    console.log('Model:', res.model);
    console.log('Tool calls:', res.toolCalls);
    console.log('Content preview:', res.content.slice(0, 200));
  } catch (err: any) {
    console.error('Groq error:', err);
  }
}

testGroqDirect();
