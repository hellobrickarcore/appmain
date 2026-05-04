import os
import json
import uuid
import datetime
import random
import requests
from supabase import create_client, Client

# 🔑 Supabase Credentials (Production)
SUPABASE_URL = "https://tlcqiixlpmpguixzbbxj.supabase.co"
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
GEMINI_API_KEY = os.environ.get("VITE_GEMINI_API_KEY", "")

if not SUPABASE_KEY or not GEMINI_API_KEY:
    print("❌ ERROR: Missing credentials. Check SUPABASE_SERVICE_ROLE_KEY and VITE_GEMINI_API_KEY.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

CATEGORIES = ["LEGO Tips", "Sorting Hacks", "AI Scanning", "MOC Inspiration", "News", "AFOL Life", "Education"]
TOPICS = [
    "How AI is revolutionizing LEGO sorting for massive collections",
    "Top 10 tips for organizing a 10,000+ brick basement collection",
    "Mastering Technic builds: A guide for advanced mechanical builders",
    "The most rare LEGO colors and where to find them in bulk lots",
    "Creating your first MOC: From identification to architectural build",
    "HelloBrick scanner vs Manual sorting: The ultimate speed test",
    "Rebrickable integration walkthrough for advanced inventory sync",
    "The physics of LEGO: Why some massive structures fail",
    "LEGO as an investment: Which sets hold the most value?",
    "Restoring old LEGO: How to clean yellowed bricks effectively",
    "The history of the LEGO brick: From wood to sustainable plastic",
    "Sorting by color vs shape: The definitive AFOL debate settled",
    "Building LEGO on a budget: Where to find the best bulk deals",
    "Top 5 LEGO storage solutions for small apartments",
    "The role of computer vision in modern hobbyist apps",
    "Designing LEGO mosaics: A technical guide to brick art",
    "The evolution of LEGO Minifigures: 40 years of character",
    "LEGO Lighting: How to bring your city builds to life with LEDs",
    "Building for stability: Structural engineering in LEGO Architecture",
    "The psychology of building: Why LEGO is the ultimate stress relief",
    "LEGO Classroom: Using AI scanning for STEM education",
    "Identifying rare Technic pins and specialized connectors",
    "A guide to LEGO Part Numbers: How to read the plastic",
    "Collaborative building: How to manage a group MOC project",
    "The future of brick recognition: What's next for HelloBrick?",
    "LEGO Photography: Tips for capturing your creations in studio light",
    "Organizing by category: The 'Library' method for LEGO parts",
    "Finding missing parts: Best practices for completing used sets"
]

def generate_blog_content(topic):
    """Generate high-quality blog content using Gemini API"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    
    prompt = f"""
    Write a detailed, high-fidelity engineering-focused blog post about: {topic}.
    Target Audience: LEGO Adult Fans (AFOLs), tech enthusiasts, and professional builders.
    Tone: Professional, inspiring, and technical.
    
    Format as JSON:
    {{
      "title": "A highly clickable, SEO-friendly title",
      "excerpt": "A catchy 2-sentence summary that encourages clicks (150 chars max)",
      "content": "Detailed markdown content with 5+ sections, bold headers, and technical tips (at least 800 words)",
      "slug": "url-friendly-slug",
      "category": "Pick one from: {', '.join(CATEGORIES)}",
      "keywords": ["lego", "sorting", "ai", "..."]
    }}
    """
    
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    res = requests.post(url, json=payload)
    
    if res.status_code != 200:
        print(f"❌ Gemini Error: {res.text}")
        return None
        
    try:
        raw_text = res.json()['candidates'][0]['content']['parts'][0]['text']
        # Clean up code blocks if Gemini returns them
        clean_json = raw_text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_json)
    except Exception as e:
        print(f"❌ JSON Parse Error: {e}")
        return None

def generate_image(title):
    """Get a high-quality LEGO themed image via Pollinations"""
    safe_title = requests.utils.quote(f"LEGO build {title}, studio lighting, professional photography, close-up")
    return f"https://image.pollinations.ai/prompt/{safe_title}?width=1280&height=720&nologo=true&seed={random.randint(1, 10000)}"

def publish_daily_blog():
    print(f"🚀 [BLOG ENGINE] Starting daily generation for {datetime.date.today()}...")
    
    topic = random.choice(TOPICS)
    post_data = generate_blog_content(topic)
    
    if not post_data:
        print("❌ Failed to generate blog content.")
        return

    # Check for slug collision
    existing = supabase.table("posts").select("id").eq("slug", post_data['slug']).execute()
    if existing.data:
        post_data['slug'] = f"{post_data['slug']}-{random.randint(10, 99)}"

    image_url = generate_image(post_data['title'])
    
    new_post = {
        "title": post_data['title'],
        "slug": post_data['slug'],
        "excerpt": post_data['excerpt'],
        "content": post_data['content'],
        "image_url": image_url,
        "category": post_data.get('category', 'LEGO Tips'),
        "author": "HelloBrick AI",
        "status": "published",
        "published_at": datetime.datetime.now().isoformat(),
        "seo_metadata": {
            "keywords": [post_data['category'], "LEGO", "AI", "HelloBrick"],
            "description": post_data['excerpt']
        }
    }

    res = supabase.table("posts").insert(new_post).execute()
    
    if hasattr(res, 'error') and res.error:
        print(f"❌ Supabase Insert Error: {res.error}")
    else:
        print(f"✅ Blog Published: {post_data['title']}")
        print(f"🔗 URL: https://hellobrick.app/blog/{post_data['slug']}")

if __name__ == "__main__":
    publish_daily_blog()
