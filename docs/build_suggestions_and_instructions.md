# Build Suggestions and Instructions

## The Problem
The "Sets" tab was previously populated with static, generic content that did not reflect the user's actual scanned/inventory bricks. When users wanted to see how to build something, there was no flow for step-by-step instructions.

## The Fix
1. **Dynamic Suggestions**: Refactored `suggestionEngine.ts` to dynamically calculate build suggestions based exactly on the bricks present in the user's local collection. Suggestions are categorized dynamically (e.g. Color Themes like "Red Essentials" or Mixed themes).
2. **Missing Pieces UI**: The Sets UI now accurately states "Can build now" or if missing pieces, specifies how many pieces are missing to encourage more scanning.
3. **Instructions Engine**: Created `InstructionsScreen.tsx` that receives the generated set details. It provides a visual breakdown of the required parts (compared against owned parts) and generates step-by-step sequential building instructions simulating an AI-generated flow.
