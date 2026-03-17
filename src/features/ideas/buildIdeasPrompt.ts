import { NormalizedVault } from '../../lib/brick/normalizeVault';

/**
 * IDEAS PROMPT CONTRACT
 * Phase 26 Hard Fix: Grounded, practical, no-AI-mention, structured JSON.
 */

export const getSystemPrompt = () => `
You are a build ideas assistant for HelloBrick. 
Your goal is to suggest small, realistic LEGO-style builds based ONLY on the bricks the user has scanned.
Never invent extra bricks or categories. 
If the user has very few bricks, suggest simple micro-builds, color patterns, or small sculptural faces.

Tone: Practical, short, and friendly. Never mention you are an "AI" or "large language model".

Response Contract (MANDATORY JSON):
{
  "assistantMessage": "Short friendly intro grounded in their inventory.",
  "topIdeas": [
    {
      "ideaName": "Creative name",
      "difficulty": "Beginner|Intermediate|Advanced",
      "estimatedBrickUse": "e.g. 5 pieces",
      "whyItFitsYourVault": "Brief reason based on their matching colors/sizes",
      "buildSteps": ["Step 1...", "Step 2..."],
      "imagePrompt": "Cartoon drawing of [description]..."
    }
  ],
  "suggestedQuickReplies": ["What can I build with this?", "Random ideas", "Make it easier", "Best idea"]
}
`;

export const buildRuntimePrompt = (userMessage: string, vault: NormalizedVault): string => {
  const topColors = Object.entries(vault.countsByColor)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color, count]) => `${color} (x${count})`)
    .join(', ');

  const topSizes = Object.entries(vault.countsBySize)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([size, count]) => `${size} (x${count})`)
    .join(', ');

  return `
USER VAULT STATUS:
- Total Bricks: ${vault.totalBricks}
- Top Colors: ${topColors}
- Top Sizes: ${topSizes}

USER REQUEST:
"${userMessage}"

INSTRUCTIONS:
1. Cross-reference the user request with the vault.
2. If inventory is limited, suggest micro-scale builds (totems, faces, mini furniture).
3. Do NOT suggest generic themes like "Space Castle" unless they have hundreds of bricks.
4. Every idea must include an 'imagePrompt' that describes a cartoon-style illustration of the build.
5. Return 1 to 3 ideas ONLY.
`;
};

/**
 * Image Prompt Formula implementation
 */
export const generateImagePrompt = (ideaName: string, colors: string[], sizes: string[]): string => {
  const colorList = colors.length > 0 ? colors.join(' and ') : 'various';
  const sizeHint = sizes.length > 0 ? `using ${sizes[0]} pieces` : 'LEGO-style';
  
  return `Cartoon drawing of a ${ideaName}, minimalist LEGO-style build using ${colorList} bricks, ${sizeHint}, clean front-facing composition, playful illustrated toy-app style, high contrast, vibrant colors, premium mobile app aesthetic`;
};
