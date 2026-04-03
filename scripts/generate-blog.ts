import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Check current dir, then one up for .env.local
dotenv.config({ path: '.env.local' });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '..', '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_API_KEY) {
  console.error('❌ Missing environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or GEMINI_API_KEY)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function generateBlogPost() {
  console.log('🚀 Starting AI Blog Generation...');

  const TOPICS = [
    "LEGO Color Theory for MOC builders: How to use contrast",
    "Total Organization: Master your 10,000+ brick collection",
    "The 2x4 Brick Legacy: How one part changed the world",
    "Lighting Your Build: 5 Pro secrets for LEGO photography",
    "AI & Bricks: How we built the world's fastest recognition engine",
    "STEM at home: Using LEGO to teach mechanical engineering",
    "The rarest LEGO parts ever made and why they cost so much",
    "Modular Building 101: Creating your first LEGO city street"
  ];

  const selectedTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  console.log(`📝 Selected Topic: "${selectedTopic}"`);

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    You are an expert LEGO blogger and SEO strategist for HelloBrick.app.
    Generate a high-authority, engaging, and SEO-optimized blog post.
    
    TOPIC: ${selectedTopic}
    
    REQUIREMENTS:
    - Title: Catchy, SEO-focused
    - Slug: URL-friendly
    - Excerpt: A 2-sentence hook
    - Content: At least 1000 words in Markdown format.
    - Category: One of [Advanced Building, Organization, History, Education, Engineering]
    - SEO Keywords: List of 5-8 keywords
    - SEO Description: Meta description
    - Image Prompt: A 1-sentence descriptive prompt for a LEGO scene

    --- OUTPUT FORMAT ---
    You MUST output the content exactly in this format:
    [[TITLE]]...title here...
    [[SLUG]]...slug-here...
    [[EXCERPT]]...excerpt here...
    [[CATEGORY]]...category here...
    [[IMAGE_PROMPT]]...prompt here...
    [[KEYWORDS]]...kw1, kw2, kw3...
    [[DESCRIPTION]]...meta description...
    [[CONTENT]]
    # Markdown Content Starts Here...
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const extract = (marker: string) => {
      const regex = new RegExp(`\\[\\[${marker}\\]\\]\\s*([\\s\\S]*?)(?=\\s*\\[\\[|$)`);
      const match = text.match(regex);
      return match ? match[1].trim() : null;
    };

    const title = extract('TITLE');
    const slug = extract('SLUG');
    const excerpt = extract('EXCERPT');
    const category = extract('CATEGORY');
    const image_prompt = extract('IMAGE_PROMPT');
    const keywords = extract('KEYWORDS')?.split(',').map(k => k.trim()) || [];
    const description = extract('DESCRIPTION');
    const content = text.split('[[CONTENT]]')[1]?.trim();

    if (!title || !slug || !content) {
      throw new Error("Missing critical fields in AI response");
    }

    console.log(`✨ Generated: "${title}"`);

    const encodedPrompt = encodeURIComponent(`lego style, high quality photography, ${image_prompt}`);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=800&nologo=true&seed=${Math.floor(Math.random()*10000)}`;

    const { error } = await supabase
      .from('posts')
      .insert([
        {
          title,
          slug,
          excerpt,
          content,
          category,
          image_url: imageUrl,
          seo_metadata: { keywords, description },
          status: 'published'
        }
      ]);

    if (error) {
      if (error.code === '23505') {
        console.warn('⚠️ Duplicate slug detected, skipping insertion.');
        process.exit(0);
      }
      console.error('❌ Supabase Insertion Error:', error);
    } else {
      console.log('✅ Published to HelloBrick Journal!');
    }

  } catch (error) {
    console.error('❌ Generation Failed:', error);
    console.log('Raw output Preview:', text.slice(0, 500));
  }
}

generateBlogPost();
