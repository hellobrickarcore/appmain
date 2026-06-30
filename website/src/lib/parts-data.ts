// ─── HelloBrick Local Part & Color Catalog Seed ─────────────────────────────
// Sourced from appmain/server/migrations/001_unified_schema.sql

export interface BrickPart {
  partNum: string;
  name: string;
  category: string;
  dimX: number;
  dimY: number;
}

export interface BrickColor {
  code: string;
  name: string;
  hex: string;
  labL: number;
  labA: number;
  labB: number;
}

// 38 Canonical LEGO Brick Part Dimensions
export const localParts: BrickPart[] = [
  { partNum: "3001", name: "2x4 Brick", category: "Bricks", dimX: 2, dimY: 4 },
  { partNum: "3002", name: "2x3 Brick", category: "Bricks", dimX: 2, dimY: 3 },
  { partNum: "3003", name: "2x2 Brick", category: "Bricks", dimX: 2, dimY: 2 },
  { partNum: "3004", name: "1x2 Brick", category: "Bricks", dimX: 1, dimY: 2 },
  { partNum: "3005", name: "1x1 Brick", category: "Bricks", dimX: 1, dimY: 1 },
  { partNum: "3006", name: "2x10 Brick", category: "Bricks", dimX: 2, dimY: 10 },
  { partNum: "3007", name: "2x8 Brick", category: "Bricks", dimX: 2, dimY: 8 },
  { partNum: "3008", name: "1x8 Brick", category: "Bricks", dimX: 1, dimY: 8 },
  { partNum: "3009", name: "1x6 Brick", category: "Bricks", dimX: 1, dimY: 6 },
  { partNum: "3010", name: "1x4 Brick", category: "Bricks", dimX: 1, dimY: 4 },
  { partNum: "3020", name: "2x4 Plate", category: "Plates", dimX: 2, dimY: 4 },
  { partNum: "3021", name: "2x3 Plate", category: "Plates", dimX: 2, dimY: 3 },
  { partNum: "3022", name: "2x2 Plate", category: "Plates", dimX: 2, dimY: 2 },
  { partNum: "3023", name: "1x2 Plate", category: "Plates", dimX: 1, dimY: 2 },
  { partNum: "3024", name: "1x1 Plate", category: "Plates", dimX: 1, dimY: 1 },
  { partNum: "3032", name: "4x6 Plate", category: "Plates", dimX: 4, dimY: 6 },
  { partNum: "3033", name: "6x10 Plate", category: "Plates", dimX: 6, dimY: 10 },
  { partNum: "3034", name: "2x8 Plate", category: "Plates", dimX: 2, dimY: 8 },
  { partNum: "3035", name: "4x8 Plate", category: "Plates", dimX: 4, dimY: 8 },
  { partNum: "3036", name: "6x8 Plate", category: "Plates", dimX: 6, dimY: 8 },
  { partNum: "3037", name: "2x4 Slope 45°", category: "Slopes", dimX: 2, dimY: 4 },
  { partNum: "3039", name: "2x2 Slope 45°", category: "Slopes", dimX: 2, dimY: 2 },
  { partNum: "3040", name: "1x2 Slope 45°", category: "Slopes", dimX: 1, dimY: 2 },
  { partNum: "3298", name: "2x3 Slope 33°", category: "Slopes", dimX: 2, dimY: 3 },
  { partNum: "3660", name: "2x2 Slope Inverted", category: "Slopes", dimX: 2, dimY: 2 },
  { partNum: "3068", name: "2x2 Tile", category: "Tiles", dimX: 2, dimY: 2 },
  { partNum: "3069", name: "1x2 Tile", category: "Tiles", dimX: 1, dimY: 2 },
  { partNum: "3070", name: "1x1 Tile", category: "Tiles", dimX: 1, dimY: 1 },
  { partNum: "2412", name: "1x2 Tile with Grille", category: "Tiles", dimX: 1, dimY: 2 },
  { partNum: "3795", name: "2x6 Plate", category: "Plates", dimX: 2, dimY: 6 },
  { partNum: "2420", name: "2x4 Plate with Pins", category: "Technic", dimX: 2, dimY: 4 },
  { partNum: "3031", name: "4x4 Plate", category: "Plates", dimX: 4, dimY: 4 },
  { partNum: "3958", name: "6x6 Plate", category: "Plates", dimX: 6, dimY: 6 },
  { partNum: "3028", name: "6x12 Plate", category: "Plates", dimX: 6, dimY: 12 },
  { partNum: "3460", name: "1x8 Plate", category: "Plates", dimX: 1, dimY: 8 },
  { partNum: "3666", name: "1x6 Plate", category: "Plates", dimX: 1, dimY: 6 },
  { partNum: "3710", name: "1x4 Plate", category: "Plates", dimX: 1, dimY: 4 },
  { partNum: "3623", name: "1x3 Plate", category: "Plates", dimX: 1, dimY: 3 },
];

// 18 Canonical LEGO Colors with LAB approximations
export const localColors: BrickColor[] = [
  { code: "21", name: "Red", hex: "#C91A09", labL: 53, labA: 60, labB: 40 },
  { code: "23", name: "Blue", hex: "#0055BF", labL: 32, labA: 10, labB: -55 },
  { code: "24", name: "Yellow", hex: "#F2CD37", labL: 88, labA: -5, labB: 75 },
  { code: "28", name: "Green", hex: "#237841", labL: 46, labA: -40, labB: 30 },
  { code: "1", name: "White", hex: "#FFFFFF", labL: 100, labA: 0, labB: 0 },
  { code: "26", name: "Black", hex: "#05131D", labL: 10, labA: 0, labB: 0 },
  { code: "106", name: "Orange", hex: "#E76318", labL: 65, labA: 45, labB: 60 },
  { code: "221", name: "Pink", hex: "#FC97AC", labL: 70, labA: 35, labB: 5 },
  { code: "268", name: "Purple", hex: "#6B5A97", labL: 35, labA: 20, labB: -25 },
  { code: "6", name: "Brown", hex: "#583927", labL: 35, labA: 15, labB: 25 },
  { code: "194", name: "Gray", hex: "#9BA19D", labL: 58, labA: 0, labB: 0 },
  { code: "119", name: "Lime", hex: "#BBE90B", labL: 78, labA: -30, labB: 50 },
  { code: "191", name: "Bright Light Orange", hex: "#F8BB3D", labL: 75, labA: 20, labB: 60 },
  { code: "226", name: "Bright Light Yellow", hex: "#FFF03A", labL: 92, labA: -10, labB: 45 },
  { code: "322", name: "Dark Azure", hex: "#078BC9", labL: 45, labA: -10, labB: -30 },
  { code: "326", name: "Medium Lavender", hex: "#A06EB9", labL: 55, labA: 25, labB: -20 },
  { code: "329", name: "Coral", hex: "#FF698F", labL: 62, labA: 40, labB: 20 },
  { code: "330", name: "Olive Green", hex: "#9B9A5A", labL: 50, labA: -20, labB: 30 },
];
