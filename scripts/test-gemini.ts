import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');

async function testModel(modelName: string) {
  console.log(`\n🔍 Testing model: ${modelName}...`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Write one sentence about LEGO.");
    const response = await result.response;
    console.log(`✅ ${modelName} Success: ${response.text().trim()}`);
    return true;
  } catch (e: any) {
    console.error(`❌ ${modelName} Failed: ${e.message}`);
    return false;
  }
}

async function runTests() {
  await testModel("gemini-1.5-flash");
  await testModel("gemini-1.5-pro");
  await testModel("gemini-pro");
}

runTests();
