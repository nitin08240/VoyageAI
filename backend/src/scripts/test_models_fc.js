const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const testModels = [
  'gemini-2.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest'
];

const tools = [{
  functionDeclarations: [{
    name: 'searchPlaces',
    description: 'search places',
    parameters: {
      type: 'object',
      properties: { dest: { type: 'string' } },
      required: ['dest']
    }
  }]
}];

async function testModel(modelName) {
  try {
    console.log(`\nTesting ${modelName}...`);
    // Turn 1
    const r1 = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: 'Places near Manali' }] }],
      config: { tools }
    });
    const fcs = r1.functionCalls;
    console.log('Turn 1 fcs:', fcs?.length);
    if (fcs && fcs.length > 0) {
      // Turn 2
      const r2 = await ai.models.generateContent({
        model: modelName,
        contents: [
          { role: 'user', parts: [{ text: 'Places near Manali' }] },
          { role: 'model', parts: [{ functionCall: { name: fcs[0].name, args: fcs[0].args } }] },
          { role: 'user', parts: [{ functionResponse: { name: fcs[0].name, response: { result: 'Solang Valley' } } }] }
        ],
        config: { tools }
      });
      console.log('Turn 2 SUCCESS! Result:', r2.text?.slice(0, 100));
      return true;
    }
  } catch (e) {
    console.log(`Failed on ${modelName}:`, e.message?.slice(0, 150));
  }
  return false;
}

async function run() {
  for (const m of testModels) {
    const ok = await testModel(m);
    if (ok) {
      console.log(`>>> MODEL ${m} WORKS 100% WITH MULTI-TURN TOOLS! <<<`);
      break;
    }
  }
}

run();

