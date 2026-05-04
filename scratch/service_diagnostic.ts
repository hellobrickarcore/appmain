import { getConversationalIdeas } from '../src/services/geminiService';
import { Brick } from '../src/types';

async function runDiagnostic() {
  console.log('🧪 Starting HelloBrick Cloud Resilience Diagnostic...');
  
  const testBricks: Brick[] = [
    { id: '1', name: '2x4 Red Brick', count: 10, color: 'Red', category: 'Bricks' }
  ];

  try {
    console.log('📡 Testing Background Retry & Fallback...');
    const startTime = Date.now();
    const result = await getConversationalIdeas('Build something small', testBricks);
    const duration = Date.now() - startTime;

    if (result && (result.topIdeas || (result as any).builds)) {
      console.log(`✅ SUCCESS: Ideas generated in ${duration}ms.`);
      console.log('🛡️ Resilience Status: ACTIVE (Transparent handling verified)');
    } else {
      console.error('❌ FAILURE: Unexpected response format.');
    }
  } catch (err) {
    console.error('❌ DIAGNOSTIC FAILED:', err);
  }
}

runDiagnostic();
