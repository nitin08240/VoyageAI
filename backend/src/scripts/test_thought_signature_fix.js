const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const tools = [{
  functionDeclarations: [{
    name: 'searchNearbyPlaces',
    description: 'Search places',
    parameters: {
      type: 'object',
      properties: { destination: { type: 'string' } },
      required: ['destination']
    }
  }]
}];

async function testFix() {
  console.log('Testing thought signature fix...');
  
  // Turn 1
  const r1 = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: [{ role: 'user', parts: [{ text: 'What are places near Rishikesh?' }] }],
    config: { tools }
  });

  const rawParts = r1.candidates[0].content.parts;
  console.log('Turn 1 succeeded! Raw parts count:', rawParts.length);
  console.log('Function calls:', r1.functionCalls?.length);

  // Turn 2 using the rawParts!
  const r2 = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: [
      { role: 'user', parts: [{ text: 'What are places near Rishikesh?' }] },
      { role: 'model', parts: rawParts },
      { role: 'user', parts: [{ functionResponse: { name: 'searchNearbyPlaces', response: { result: [{ name: 'Ram Jhula' }, { name: 'Neer Garh' }] } } }] }
    ],
    config: { tools }
  });

  console.log('🎉 Turn 2 SUCCESS with thought signature preserved!');
  console.log('Final text preview:', r2.text?.slice(0, 150));
}

testFix().catch(e => console.error('Error:', e.message));

