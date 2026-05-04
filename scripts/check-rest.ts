const KEY = process.env.VITE_GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${KEY}`;

async function checkModels() {
  console.log("🔍 Checking available models via REST...");
  try {
    const resp = await fetch(URL);
    const data = await resp.json();
    console.log("📦 Available Models:", JSON.stringify(data.models?.map((m: any) => m.name), null, 2));
  } catch (e) {
    console.error("❌ REST Check Failed", e);
  }
}
checkModels();
