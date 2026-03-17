import { Brick } from '../../types';

export interface NormalizedBrick {
  id: string;
  sizeLabel: string;
  colorLabel: string;
  category: "brick" | "plate" | "tile" | "technic" | "round" | "unknown";
  confidence: number | null;
  count: number;
  originalLabel: string;
}

const COLOR_MAP: Record<string, string> = {
  'yellow': 'Yellow',
  'red': 'Red',
  'blue': 'Blue',
  'green': 'Green',
  'white': 'White',
  'black': 'Black',
  'orange': 'Orange',
  'gray': 'Light Bluish Gray',
  'grey': 'Light Bluish Gray',
  'brown': 'Reddish Brown',
  'tan': 'Tan',
  'lime': 'Lime',
  'purple': 'Purple',
  'pink': 'Pink'
};

/**
 * Normalizes any brick source (scanner, collection, storage) into a clean grounded format.
 */
export function normalizeVaultBrick(raw: any): NormalizedBrick {
  const label = (raw.name || raw.label || "").toLowerCase();
  const colorField = (raw.color || "").toLowerCase();
  
  // 1. Extract Size (NxM)
  let sizeLabel = "Unknown";
  const sizeMatch = label.match(/(\d+)\s*[x*]\s*(\d+)/) || (raw.dimensions || "").match(/(\d+)\s*[x*]\s*(\d+)/);
  if (sizeMatch) {
    sizeLabel = `${sizeMatch[1]}x${sizeMatch[2]}`;
  }

  // 2. Extract Color
  let colorLabel = "Unknown";
  // Try finding color in label first
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (label.includes(key)) {
      colorLabel = val;
      break;
    }
  }
  // Fallback to explicit color field
  if (colorLabel === "Unknown" && colorField) {
    for (const [key, val] of Object.entries(COLOR_MAP)) {
      if (colorField.includes(key)) {
        colorLabel = val;
        break;
      }
    }
    // If it's a known string but not in our map, capitalize it
    if (colorLabel === "Unknown" && colorField.length > 2) {
      colorLabel = colorField.charAt(0) + colorField.slice(1);
    }
  }

  // 3. Infer Category
  let category: NormalizedBrick["category"] = "unknown";
  if (label.includes("plate")) category = "plate";
  else if (label.includes("tile")) category = "tile";
  else if (label.includes("technic")) category = "technic";
  else if (label.includes("round")) category = "round";
  else if (label.includes("brick")) category = "brick";
  else if (sizeLabel !== "Unknown") category = "brick"; // Default for NxM if not specified

  return {
    id: raw.id || `norm_${Math.random().toString(36).substr(2, 9)}`,
    sizeLabel,
    colorLabel,
    category,
    confidence: raw.confidence || null,
    count: raw.count || 1,
    originalLabel: raw.name || raw.label || "Untitled Part"
  };
}
