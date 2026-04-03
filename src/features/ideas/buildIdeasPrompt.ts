import { NormalizedVault } from '../../lib/brick/normalizeVault';

/**
 * IDEAS PROMPT CONTRACT
 * Phase 26 Hard Fix: Grounded, practical, no-AI-mention, structured JSON.
 */

export const getSystemPrompt = () => `
You are generating tiny build ideas for a LEGO brick app.
You must only suggest builds that can plausibly be made from the user’s scanned vault.

Tone: Simple, helpful, ChatGPT-style. Do not optimize for "fun".

Response Contract (MANDATORY JSON):
{
  "assistantMessage": "Short friendly intro grounded in their inventory.",
  "topIdeas": [
    {
      "ideaName": "Name",
      "difficulty": "Beginner|Easy|Medium",
      "whyItFitsYourVault": "Brief reason based on inventory",
      "estimatedBrickUse": number,
      "buildSteps": ["Step 1...", "Step 2..."],
      "imagePrompt": "Specific build target description"
    }
  ],
  "suggestedQuickReplies": ["What can I build?", "Random ideas"]
}

STRICT PRODUCT RULES:
- Suggest only very simple builds made only from visible interlocking bricks.
- Use only the listed colors/sizes.
- Do not assume extra part types (curves, wheels, hinges, minifigs).
- Only allowed idea types: stack, tower, gate, wall pattern, block letter, tiny car/house/robot/flower/boat (plain block forms only).
- Avoid dinosaurs, castles, space, fantasy, emojis, racing graphics, abstract symbols.
- Every idea must be visually buildable from approximately the usable brick count.
`;

export const buildRuntimePrompt = (userMessage: string, vault: NormalizedVault): string => {
  const allowedColors = Object.keys(vault.countsByColor).join(', ');
  const allowedSizes = Object.keys(vault.countsBySize).join(', ');
  const maxBricksForImage = Math.max(3, Math.min(20, Math.round(vault.totalBricks * 0.6)));

  return `
USER VAULT STATUS:
- Total Bricks: ${vault.totalBricks}
- Usable Bricks for each image: ${maxBricksForImage}
- Allowed Colors: ${allowedColors}
- Allowed Sizes: ${allowedSizes}

USER REQUEST:
"${userMessage}"

INSTRUCTIONS:
1. Suggest 1 to 3 ideas.
2. Ensure estimatedBrickUse <= ${vault.totalBricks}.
3. Return ONLY JSON matching the schema.
4. imagePrompt field must be a strict specific build target description (e.g. "a tiny gate"). Do not use abstract words.
`;
};

/**
 * Image Prompt Formula implementation (aligned with Hard Fix v2)
 * BASE STYLE (ALWAYS INCLUDED):
 * "Clean cartoon LEGO-style build, simple block geometry, smooth plastic texture, soft shadows, studio lighting, bright neutral background, front 3/4 angle, centered composition, minimal toy-app aesthetic, high clarity, no clutter"
 */
export const buildIdeaImagePrompt = (idea: { ideaName: string; imagePrompt?: string; estimatedBrickUse?: number }, vault: NormalizedVault): string => {
  const dynContent = idea.imagePrompt || idea.ideaName;
  
  const colors = Object.keys(vault.countsByColor).slice(0, 4).join(' and ');
  const sizes = Object.keys(vault.countsBySize).slice(0, 4).join(' and ');
  const nBricks = idea.estimatedBrickUse || Math.max(3, Math.min(20, Math.round(vault.totalBricks * 0.6)));

  /**
   * NEW IMAGE PROMPT FORMAT (Phase 28 Vector Style):
   * “A clean isometric pixel-perfect 2D vector technical drawing of a small LEGO build. 
   * Highly detailed flat cel-shaded style with black outlines. Solid vibrant colors. 
   * Pure white background. No text, no fonts, no letters, no extra scenery, no realistic lighting. 
   * Just a clean architectural drawing of {SPECIFIC BUILD} built from approximately {N} bricks, 
   * using only {COLORS}, using only {SIZES}.”
   */
  const buildTarget = dynContent.toLowerCase().startsWith('a ') || dynContent.toLowerCase().startsWith('an ') 
    ? dynContent 
    : `a ${dynContent}`;

  return `A clean isometric pixel-perfect 2D vector technical drawing of a small LEGO build. Highly detailed flat cel-shaded style with black outlines. Solid vibrant colors. Pure white background. No text, no fonts, no letters, no extra scenery, no realistic lighting. Just a clean architectural drawing of ${buildTarget} built from approximately ${nBricks} bricks, using only ${colors}, using only ${sizes}.`;
};
