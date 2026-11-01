import dotenv from 'dotenv';
dotenv.config();

import { GeminiProvider } from '../services/ai/gemini.provider';
import { CHAT_TOOLS_DEFINITIONS } from '../modules/chat/chat.tools';
import { buildChatSystemPrompt } from '../modules/chat/chat.prompt';

async function testDirect() {
  console.log('Testing GeminiProvider directly...');
  const provider = new GeminiProvider();
  const systemPrompt = buildChatSystemPrompt();
  
  try {
    const res = await provider.generateChatResponse(
      [{ role: 'user', content: 'What are the best destinations in Uttarakhand?' }],
      CHAT_TOOLS_DEFINITIONS,
      systemPrompt
    );
    console.log('Gemini response success:');
    console.log('Provider:', res.provider);
    console.log('Model:', res.model);
    console.log('Tool calls:', res.toolCalls);
    console.log('Content preview:', res.content.slice(0, 200));
  } catch (err: any) {
    console.error('Gemini error:', err);
  }
}

testDirect();
