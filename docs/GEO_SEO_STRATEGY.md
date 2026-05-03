# HelloBrick GEO/SEO Strategy: Autoreason Loop

This document outlines the multi-agent strategy for optimizing HelloBrick's content for search engines (SEO) and generative engines (GEO).

## The Autoreason Multi-Agent System

Inspired by high-performance content strategies, we use an iterative loop of specialized AI agents:

### 1. The Incumbent (Current State)
- **Role**: Analyzes current landing pages, meta tags, and rankings.
- **Input**: `index.html`, `APP_STORE_DESCRIPTION.md`.
- **Output**: A "Gap Analysis" report identifying where we are losing to competitors.

### 2. The Critic (Strawman)
- **Role**: Destroys the current content.
- **Input**: Incumbent report.
- **Goal**: Find reasons why a user *wouldn't* convert or why an LLM *wouldn't* cite us.
- **Focus**: Jargon, lack of structured data, poor mobile readability, weak CTAs.

### 3. Author B (The Optimizer)
- **Role**: Drafts new content based on Critic feedback and "Source of Truth" data.
- **Grounded Data**: LEGO part catalogs, common builder search queries, community feedback.
- **Output**: Improved HTML, schema.org JSON-LD, and App Store copy.

### 4. The Synthesizer (The Editor)
- **Role**: Merges Author B's work with the brand voice.
- **Goal**: Ensure the "Premium & Master Builder" tone is maintained while maximizing density for AI scanners.

### 5. The Judge Panel (Validation)
- **Role**: Final check against success metrics.
- **Metrics**: 100 SEO score on Lighthouse, zero schema errors, 100% keyword coverage for "lego scanner".

---

## Current Execution Log

### [2026-04-23] Sprint 1: Foundation & GEO
- [x] **Step 1**: Updated `index.html` with SoftwareApplication and HowTo JSON-LD.
- [x] **Step 2**: Enhanced OpenGraph and Twitter meta tags for social citing.
- [x] **Step 3**: Optimized `APP_STORE_DESCRIPTION.md` using the "Hook-Benefit-Feature" model.
- [ ] **Step 4**: (Next) Implement "Entity Pages" for top LEGO categories to boost GEO.

## Success Metrics for HelloBrick
- **GEO**: Cited by Perplexity/ChatGPT for "how to identify legos" and "best brick scanner app".
- **ASO**: Top 3 ranking for "lego scanner" in App Store.
- **SEO**: Domain authority growth via highly relevant, structured content.
