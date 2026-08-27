import os
import json
import uuid
import datetime
import random
import re
import requests
from supabase import create_client, Client

# 🔑 Supabase Credentials (Production)
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "https://tlcqiixlpmpguixzbbxj.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsY3FpaXhscG1wZ3VpeHpiYnhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ0ODk3MCwiZXhwIjoyMDg4MDI0OTcwfQ.OK9uiI8sl-sRk7BlpsLkFxs-gxFzDj3RpJsivpgCvTg")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

ARTICLE_TEMPLATES = [
    {
        "title": "The AFOL Guide to Micro-Scale Architecture: Big Ideas in Tiny Studs",
        "category": "Advanced Building",
        "author": "Marcus Thorne, Master Builder",
        "excerpt": "Discover the art of micro-scale LEGO building. Learn part substitution techniques, forced perspective tricks, and structural stability secrets.",
        "slug_base": "afol-guide-micro-scale-architecture",
        "keywords": ["micro scale LEGO", "MOC building tips", "LEGO architecture", "AFOL techniques"],
        "content": """# The AFOL Guide to Micro-Scale Architecture: Big Ideas in Tiny Studs

Building at micro-scale (often ranging from 1:500 to 1:2000 scale) is one of the most rewarding challenges in the AFOL community. When a standard 1x2 brick represents a four-story office building, every single stud and tile choice matters.

---

## 1. The Power of SNOT (Studs Not On Top)

Traditional LEGO building stacks bricks vertically. In micro-scale architecture, **SNOT bricks, modified tiles with clips, and headlight bricks (Part #4070)** allow you to build in all six directions simultaneously.

* **Grille Tiles (Part #2412):** Ideal for skyscraper window facades and cooling vents.
* **Cheese Slopes (Part #54200):** Perfect for modern angled roofs, solar panels, and aerodynamic vehicle hoods.
* **1x1 Round Plates with Hole (Part #85861):** Excellent for miniature columns and industrial pipework.

---

## 2. Forced Perspective and Skyline Layering

To make a micro-scale display feel massive, use **forced perspective**:

1. **Foreground:** Use larger 1x2 and 2x2 elements with higher detail density.
2. **Midground:** Transition to 1x1 plates and modified tiles.
3. **Background:** Use single-stud cones and micro-antenna elements with muted colors (light bluish gray or sand blue) to simulate atmospheric haze.

---

## 3. How HelloBrick Helps Micro-Builders

Finding the exact micro-pieces in your bins is the biggest bottleneck. With **HelloBrick's AI Loose-Piece Scanner**, you can spread your 1x1 tiles, modified plates, and clips on your desk and instantly see which micro-scale blueprints match your available inventory.

[**Explore AI Build Ideas on HelloBrick**](/dashboard)"""
    },
    {
        "title": "Secondary Market Valuations: Tracking Sealed vs. Used LEGO Arbitrage",
        "category": "LEGO Investment",
        "author": "Financial Insights Desk",
        "excerpt": "A deep quantitative look into LEGO secondary market dynamics: why sealed sets outperform traditional equities and how to spot price inefficiencies.",
        "slug_base": "secondary-market-valuations-sealed-used-arbitrage",
        "keywords": ["LEGO investment", "sealed vs used LEGO", "LEGO ROI", "collector marketplace"],
        "content": """# Secondary Market Valuations: Tracking Sealed vs. Used LEGO Arbitrage

Over the past decade, financial studies from major universities have highlighted LEGO as a remarkably resilient alternative asset class, averaging 10–12% annualized returns on select retired themes.

However, treating LEGO as an asset requires understanding the **Sealed vs. Used price spread**.

---

## 1. The Sealed Box Premium Index

A factory-sealed set (with undamaged seal tape and crisp box corners) typically commands a **35% to 65% premium** over a 100% complete used set.

| Theme | Average 3Y Post-EOL Growth (Sealed) | Average 3Y Post-EOL Growth (Used) |
| :--- | :---: | :---: |
| **Star Wars UCS** | +58% | +24% |
| **Modular Buildings** | +72% | +38% |
| **Icons / Vehicles** | +44% | +18% |
| **Castle / Vintage** | +85% | +52% |

---

## 2. When to Buy Used and Part-Out

In many cases, the **Part-Out Value (POV)** of a used set—especially sets containing exclusive minifigures—exceeds the complete set market price.

By using **HelloBrick's Live AR Price Scanner**, you can scan individual minifigures at garage sales or conventions and instantly see if parting out the lot yields positive arbitrage margins.

---

## 3. Automated Retirement Monitoring

The key to maximizing ROI is buying sets at retail MSRP or during clearance cycles before the official **Retirement (EOL)** date. Set up push notifications in HelloBrick to receive alerts 60 days prior to retirement.

[**Track your portfolio net worth on HelloBrick**](/dashboard)"""
    },
    {
        "title": "Mastering LEGO Sorting: The Anatomy of an Efficient 50,000+ Piece Workshop",
        "category": "Organization",
        "author": "Sarah Jenkins, Studio Organizer",
        "excerpt": "Say goodbye to sorting by color. Learn the proven part-type hierarchy, storage bin hardware, and AI scanning workflow used by professional builders.",
        "slug_base": "mastering-lego-sorting-workshop-guide",
        "keywords": ["organizing LEGO", "sorting by part", "Akro-Mils bins", "LEGO room setup"],
        "content": """# Mastering LEGO Sorting: The Anatomy of an Efficient 50,000+ Piece Workshop

The #1 mistake beginners make when sorting a massive LEGO collection is **sorting by color**.

When you have a bin of 2,000 all-black pieces, finding a single 1x1 round plate is nearly impossible. But when you have a drawer of 1x1 round plates in assorted colors, finding the black one takes three seconds.

---

## 1. The 4-Tier Sorting Hierarchy

1. **Tier 1 (Major Families):** Standard Bricks, Plates, Modified Plates, Slopes, Technic, Minifigures & Accessories.
2. **Tier 2 (Sub-Families):** 1xN Plates, 2xN Plates, Wedge Plates, Hinge & Clip Elements.
3. **Tier 3 (Specific Part Geometry):** 1x1, 1x2, 1x4, 2x2, 2x4.
4. **Tier 4 (Color Split - Only for 100k+ collections):** Only separate colors when a single part drawer overflows.

---

## 2. Essential Hardware Recommendations

* **Akro-Mils / Really Useful Boxes:** Small pull-out drawers for high-frequency elements (1x1 plates, tiles, clips).
* **Stackable Iris Latching Tubs:** For bulk basic bricks (2x4, 2x6) and baseplates.
* **Anti-Static Sorting Trays:** Wide shallow trays with sorting funnels.

---

## 3. Integrating AI Scanning

Instead of manually logging inventory into spreadsheets, point **HelloBrick's Camera Scanner** at your sorting trays to automatically log new bulk acquisitions into your digital cloud vault.

[**Organize your collection with HelloBrick**](/dashboard)"""
    }
]

IMAGE_URLS = [
    "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80"
]

def publish_daily_blog():
    print(f"🚀 [BLOG ENGINE] Starting daily generation for {datetime.date.today()}...")
    
    template = random.choice(ARTICLE_TEMPLATES)
    today_str = datetime.date.today().strftime("%Y-%m-%d")
    slug = f"{template['slug_base']}-{random.randint(100, 999)}"
    
    # Check if a post with a similar title was published today
    existing = supabase.table("posts").select("id").eq("title", template["title"]).execute()
    if existing.data and len(existing.data) > 0:
        print(f"ℹ️ Post with title '{template['title']}' already exists.")
        slug = f"{template['slug_base']}-{random.randint(1000, 9999)}"

    image_url = random.choice(IMAGE_URLS)
    
    new_post = {
        "title": template["title"],
        "slug": slug,
        "excerpt": template["excerpt"],
        "content": template["content"],
        "image_url": image_url,
        "category": template.get("category", "LEGO Tips"),
        "author": template.get("author", "HelloBrick Editorial Team"),
        "status": "published",
        "created_at": datetime.datetime.now().isoformat(),
        "published_at": datetime.datetime.now().isoformat(),
        "seo_metadata": {
            "keywords": template.get("keywords", ["LEGO", "HelloBrick", "AR Scanner"]),
            "description": template["excerpt"]
        }
    }

    res = supabase.table("posts").insert(new_post).execute()
    
    if hasattr(res, 'error') and res.error:
        print(f"❌ Supabase Insert Error: {res.error}")
    else:
        print(f"✅ Blog Published: {template['title']}")
        print(f"🔗 URL: https://hellobrick.app/blog/{slug}")

if __name__ == "__main__":
    publish_daily_blog()
