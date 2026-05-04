# HelloBrick SEO Automation: Keywordo-kun AI 🤖

To accelerate organic growth, we have integrated the **Keywordo-kun AI SEO Agent** via n8n. This agent automates keyword research, competitor analysis, and content outlining.

## 🚀 Quick Start

1.  **Start n8n**:
    Run `docker-compose up -d n8n` from the root directory.
    Access n8n at [http://localhost:5678](http://localhost:5678).

2.  **Import Workflows**:
    Download the following JSON files and import them into n8n via **Settings > Import from File**:
    - [Main Agent JSON](https://raw.githubusercontent.com/AgriciDaniel/Keywordo-kun-AI-SEO-Agent-n8n-Workflow/refs/heads/main/Keywordo-kun%20(Articollo%20Agent).json)
    - [Tools JSON](https://raw.githubusercontent.com/AgriciDaniel/Keywordo-kun-AI-SEO-Agent-n8n-Workflow/refs/heads/main/Keywordo-kun%20(Tools).json)

3.  **Configure API Keys**:
    You will need keys for:
    - **Google Gemini** (Brain)
    - **DataForSEO** (Keyword Data)
    - **Firecrawl** (Web Scraping)

## 📊 Capabilities
- **Ranked Keywords**: Finds what your competitors are ranking for.
- **Keyword Ideas**: Generates low-difficulty, high-volume opportunities.
- **AI Mode**: Real-time SERP analysis of "AI Overviews".
- **Internal Links**: Suggests linking opportunities across your blog.

---
*Created for HelloBrick Growth Strategy - April 2026*
