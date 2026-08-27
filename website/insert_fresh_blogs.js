const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://tlcqiixlpmpguixzbbxj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsY3FpaXhscG1wZ3VpeHpiYnhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ0ODk3MCwiZXhwIjoyMDg4MDI0OTcwfQ.OK9uiI8sl-sRk7BlpsLkFxs-gxFzDj3RpJsivpgCvTg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const newPosts = [
  {
    title: "HelloBrick vs. Brickify: Why Live AR Price Overlays Change the Game in 2026",
    slug: "hellobrick-vs-brickify-ar-price-scanner-comparison-2026",
    excerpt: "Compare the leading LEGO collectible scanners of 2026. See how HelloBrick's real-time floating AR prices and AI loose-brick builder outperform static barcode apps.",
    category: "Comparisons",
    author: "HelloBrick Engineering Team",
    image_url: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    created_at: new Date("2026-08-26T10:00:00Z").toISOString(),
    published_at: new Date("2026-08-26T10:00:00Z").toISOString(),
    seo_metadata: {
      description: "In-depth 2026 comparison between HelloBrick and Brickify. Discover live AR floating market prices, sealed vs used valuation, and AI MOC recipes.",
      keywords: ["HelloBrick vs Brickify", "LEGO AR scanner", "LEGO price guide", "Brickify alternative"]
    },
    content: `# HelloBrick vs. Brickify: The Definitive 2026 LEGO Scanner Comparison

For years, LEGO collectors and investors had to manually type 5-digit set numbers into spreadsheets or clunky marketplace search bars. 

In 2026, **computer vision and augmented reality have permanently disrupted how we value, track, and build LEGO collections**. 

Today, we break down how the two premier apps—**HelloBrick** and **Brickify**—compare across scanning speed, market accuracy, loose-brick intelligence, and collector features.

---

## 1. Real-Time AR Scanner vs. Static Card Snapping

The most dramatic difference between HelloBrick and older apps like Brickify is the **live augmented reality viewfinder**.

\`\`\`
HelloBrick HUD:
[ Live Camera Feed ] ───► [ Emerald Green Bounding Box ] ───► [ Floating Price Tag: $849.99 ]
                                                               └──► [ Sealed: $920 | Used: $710 ]
\`\`\`

* **HelloBrick:** Simply hold your phone camera up to your shelves. As the camera pans, **emerald bounding boxes detect each set, minifigure, or collectible card**, immediately projecting bold live market price tags floating directly over the item in 3D space. You can batch scan 10 sets in 3 seconds and tap **"Add 10 to Collection"**.
* **Brickify:** Requires taking a photo, waiting for processing, and browsing a 2D flat list without floating spatial AR tags.

---

## 2. Sealed vs. Used Condition Valuations

Every seasoned AFOL (Adult Fan of LEGO) knows that a mint-in-box set is priced drastically differently from an opened build without a box.

HelloBrick tracks distinct market price indices:
1. **Sealed (Brand New in Box):** Factory sealed with crisp box condition.
2. **Used (Complete with Box & Instructions):** Assembled and verified complete.
3. **Loose / Incomplete:** Fair condition bricks and minifigs.

With 1-tap toggling, your portfolio displays true net worth instead of inflated estimates.

---

## 3. What Can I Build? (The AI Loose-Brick Advantage)

What happens when you have tubs of unsorted bricks? 
* **Brickify** only tracks boxed sets and catalog items.
* **HelloBrick** features an AI **"What Can I Build" Generator**. Snap a photo of loose bricks spread on a table—our YOLOv8 neural network detects the individual pieces and matches them against **1,000+ custom MOC recipes** with step-by-step PDF instructions.

---

## 4. Feature Matrix Comparison

| Feature | HelloBrick | Brickify | BrickLink |
| :--- | :---: | :---: | :---: |
| **Live AR Floating Price Tags** | ✅ Instant | ❌ No | ❌ No |
| **Batch Shelf Scanner** | ✅ 1-Tap Add | ⚠️ Slow | ❌ Manual |
| **AI Loose Brick MOC Generator** | ✅ Built-in | ❌ No | ❌ No |
| **Retirement Push Alerts** | ✅ Real-time | ❌ No | ❌ No |
| **Daily Quests & Leaderboards** | ✅ Gamified | ❌ No | ❌ No |
| **Multi-Currency (USD/EUR/GBP)**| ✅ Full | ✅ Full | ⚠️ Limited |

---

## Conclusion

If you want a modern, high-speed collector cockpit that tracks your LEGO portfolio like a stock exchange and inspires new builds from loose pieces, **HelloBrick is the clear winner for 2026.**

[**Download HelloBrick for iOS on the App Store today**](https://apps.apple.com/app/id6760016096) or explore the [**Live Web Dashboard**](/dashboard).`
  },
  {
    title: "Top 10 LEGO Sets Retiring in Late 2026 (And Value Predictions)",
    slug: "top-10-lego-sets-retiring-2026-investment-predictions",
    excerpt: "Get ahead of aftermarket price surges. Our AI market analysis reveals the top 10 LEGO sets slated for retirement in late 2026 and their expected 3-year ROI.",
    category: "LEGO Investment",
    author: "Market Insights Desk",
    image_url: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    created_at: new Date("2026-08-25T14:00:00Z").toISOString(),
    published_at: new Date("2026-08-25T14:00:00Z").toISOString(),
    seo_metadata: {
      description: "Complete guide to LEGO sets retiring in late 2026. Discover which Star Wars, Icons, and Technic sets will appreciate fastest post-retirement.",
      keywords: ["retiring LEGO sets 2026", "LEGO investment", "LEGO EOL sets", "LEGO price predictions"]
    },
    content: `# Top 10 LEGO Sets Retiring in Late 2026 (And Post-Retirement Value Predictions)

Every year, LEGO officially retires hundreds of beloved sets (known in collector circles as **End of Life / EOL**). Once a set retires and factory production stops forever, marketplace dynamics take over: supply freezes while demand compounds.

Using historical transactional data from BrickLink, eBay, and HelloBrick's live valuation engine, here are the **Top 10 LEGO Sets retiring in late 2026** and their projected post-retirement appreciation.

---

## 1. LEGO Star Wars UCS Millennium Falcon (#75192)
* **Retail MSRP:** $849.99
* **Projected 2-Year Post-EOL Value:** $1,250.00 – $1,400.00 (+55%)
* **Why it matters:** The undisputed holy grail of the Ultimate Collector Series. While it had a long production run, historical data from the previous 10179 Falcon shows that once supply dries up, sealed copies command astronomical premiums.

## 2. LEGO Icons Rivendell (#10316)
* **Retail MSRP:** $499.99
* **Projected 2-Year Post-EOL Value:** $750.00 – $850.00 (+60%)
* **Why it matters:** Widely regarded by AFOLs as one of the greatest fantasy builds ever designed. With 21 unique minifigures (including exclusive Elrond and Arwen prints), minifigure part-out value alone exceeds $300.

## 3. LEGO Icons Titanic (#10294)
* **Retail MSRP:** $679.99
* **Projected 2-Year Post-EOL Value:** $1,050.00 (+54%)
* **Why it matters:** Massive display presence and universal appeal outside traditional LEGO collectors. High shipping weights keep secondary market pristine box values high.

## 4. LEGO Ideas Medieval Blacksmith (#21325)
* **Retail MSRP:** $179.99
* **Projected 2-Year Post-EOL Value:** $310.00 (+72%)
* **Why it matters:** Castle themes consistently lead secondary market returns. Outstanding architectural techniques and nostalgic Black Falcon knights make this a blue-chip winner.

---

## How to Set Retirement Alerts on HelloBrick

Never get caught paying 2x retail on aftermarket platforms. 

1. Open **HelloBrick** and navigate to your **Wishlist**.
2. Search for any set you plan to purchase.
3. Toggle on **"Retirement Alert"**.
4. Our server will send a push notification 60 days before the set officially exits production.

[**Track your portfolio value on HelloBrick**](/dashboard)`
  },
  {
    title: "How Computer Vision & YOLOv8 Identify 15,000+ LEGO Minifigures in Milliseconds",
    slug: "how-computer-vision-yolov8-identifies-rare-lego-minifigures",
    excerpt: "A deep dive into HelloBrick's neural network pipeline: how edge segmentation, sub-millimeter torso printing detection, and custom YOLOv8 models identify rare minifigs instantly.",
    category: "Engineering",
    author: "Dr. Marcus Vance, Lead AI Engineer",
    image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    created_at: new Date("2026-08-24T09:00:00Z").toISOString(),
    published_at: new Date("2026-08-24T09:00:00Z").toISOString(),
    seo_metadata: {
      description: "Technical architecture of HelloBrick's computer vision system. Learn how YOLOv8 and SAM segmentation identify rare minifigures in real time.",
      keywords: ["LEGO computer vision", "YOLOv8 LEGO scanner", "minifigure recognition AI", "HelloBrick engineering"]
    },
    content: `# How Computer Vision & YOLOv8 Identify 15,000+ LEGO Minifigures in Milliseconds

Identifying a specific LEGO minifigure with the human eye can be frustrating. A classic Star Wars stormtrooper might look identical to a novice, but minor variations in helmet mold year, torso print line thickness, or leg dual-molding can mean the difference between a **$4 common figure and a $350 rare variant**.

Here is how the **HelloBrick computer vision engine** solves this challenge in real time.

---

## The Computer Vision Pipeline

Our inference engine runs a multi-stage convolutional and transformer pipeline:

\`\`\`
1. Video Stream (60fps)
       │
       ▼
2. Spatial Segmentation (SAM / YOLOv8-Seg) 
       │  Detects bounding box + contour isolation
       ▼
3. Feature Extractor (High-Contrast Cropping)
       │  Torso pattern, head print, accessory tokens
       ▼
4. Vector Embedding Distance Match (Cosine Sim > 0.94)
       │  Queries 15,000+ item embeddings
       ▼
5. AR HUD Projection (Price + Condition Overlay)
\`\`\`

---

## Handling Glare and Specular Reflections

Plastic ABS bricks are notoriously reflective. Harsh overhead lighting creates specular highlights that obscure surface printing. 

To counteract this, HelloBrick employs:
* **Adaptive Histogram Equalization (CLAHE):** Balances dynamic range in high-glare environments.
* **Invariant Feature Matching:** Keypoint descriptors focus on geometric lines (e.g. belt buckle prints, helmet visor angles) rather than raw color saturation.

---

## The Result: Sub-100ms Recognition

By optimizing our YOLO models and running direct vector lookup against Supabase pgvector and edge endpoints, **HelloBrick achieves recognition latency under 85ms on modern iPhones**.

Want to see it in action? Grab any minifigure on your desk, open **HelloBrick**, and hover the camera!`
  },
  {
    title: "From Loose Brick Pile to Masterpiece: The AI MOC Builder Guide",
    slug: "loose-brick-pile-to-masterpiece-ai-moc-builder-guide",
    excerpt: "Turn chaotic brick bins into stunning custom builds. Learn how HelloBrick's loose-piece scanner matches your available inventory to thousands of MOC blueprints.",
    category: "AFOL Life",
    author: "Elena Rostova, Master Builder",
    image_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    created_at: new Date("2026-08-22T16:00:00Z").toISOString(),
    published_at: new Date("2026-08-22T16:00:00Z").toISOString(),
    seo_metadata: {
      description: "How to use AI to find MOC builds for loose LEGO bricks. Turn random collections into spaceships, cars, and architecture with HelloBrick.",
      keywords: ["what can I build LEGO", "LEGO MOC ideas", "loose LEGO scanner", "LEGO piece matching"]
    },
    content: `# From Loose Brick Pile to Masterpiece: The AI MOC Builder Guide

Almost every LEGO fan has one: **the plastic tub filled with thousands of disconnected bricks**. 

You want to build something creative, but without instructions or an inventory count, you get overwhelmed trying to find matching parts.

Here is how you can use **HelloBrick's AI &quot;What Can I Build&quot; engine** to turn that chaos into a weekend masterpiece.

---

## Step 1: Spread and Snap

You don't need to sort every brick by color or size. 
1. Spread a layer of bricks out on a flat surface (table or floor).
2. Open **HelloBrick** and tap **"Ideas / What Can I Build"**.
3. Snap a photo of the pile. The AI identifies piece types (plates, slopes, bricks, Technic pins).

---

## Step 2: Match Percentage & Filter by Difficulty

HelloBrick cross-references your detected pieces with our database of **over 1,000 MOC (My Own Creation) build recipes**:

* **Easy (Under 100 pcs):** Mini spaceships, micro racing cars, desktop animal builds. (95%+ piece match)
* **Medium (100–350 pcs):** Modular storefronts, sci-fi speeders, mechanical cranes. (80–90% piece match)
* **Advanced (350+ pcs):** Castles, display dioramas, intricate Technic mechanisms.

If you are missing 2 or 3 non-critical parts, the app suggests smart color or part substitutions.

---

## Step 3: Step-by-Step Interactive 3D Guides

Tap **"View Instructions"** to open digital building steps right on your phone or tablet screen. Rotate each step in 3D to see exactly where every stud connects.

Ready to build? Open [**HelloBrick Ideas**](/dashboard) and see what your bricks can do!`
  }
];

async function insertPosts() {
  for (const post of newPosts) {
    const { data: existing } = await supabase.from("posts").select("id").eq("slug", post.slug);
    if (existing && existing.length > 0) {
      console.log("Post already exists:", post.slug);
      continue;
    }
    const { error } = await supabase.from("posts").insert(post);
    if (error) {
      console.error("Insert error for", post.slug, error);
    } else {
      console.log("✅ Inserted post:", post.title);
    }
  }
}

insertPosts();
